import { prisma } from "@/lib/prisma";
import type { AddressType, OrderStatus, PaymentMethod, Prisma } from "@/generated/prisma/client";
import { computeCartTotal, getCartWithPricing } from "@/server/services/cart-service";
import { PAYMENT_METHOD_OPTIONS } from "@/server/services/payment-service";
import { logInventoryChange } from "@/server/services/inventory-service";
import { isUuid } from "@/lib/utils";

export class OrderError extends Error {}

const RESERVATION_DAYS = 3;

// Badge/label de OrderStatus centralizados aquí: antes de esto, cada página
// que renderizaba un pedido (dashboard, lista admin, detalle admin, detalle
// del cliente) redeclaraba el mismo Record<OrderStatus, ...> por separado.
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  reservado: "Reservado",
  confirmado: "Confirmado",
  enviado: "Enviado",
  cancelado: "Cancelado",
  vencido: "Vencido",
};

export const ORDER_STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  "secondary" | "default" | "destructive"
> = {
  reservado: "secondary",
  confirmado: "default",
  enviado: "default",
  vencido: "destructive",
  cancelado: "destructive",
};

// Transiciones manuales que el admin puede disparar desde /admin/pedidos
// (ticket de gestión de pedidos). `vencido` no aparece como destino: ese
// estado solo lo pone el cron de expiración (ticket #28), nunca un admin a
// mano. Los estados terminales (enviado, cancelado, vencido) no tienen salida.
const ALLOWED_MANUAL_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  reservado: ["confirmado", "cancelado"],
  confirmado: ["enviado", "cancelado"],
  enviado: [],
  cancelado: [],
  vencido: [],
};

export function getAllowedNextStatuses(status: OrderStatus): OrderStatus[] {
  return ALLOWED_MANUAL_TRANSITIONS[status];
}

// Compartida por expireReservedOrders (cron) y updateOrderStatus (cancelación
// manual desde el admin) — ambos casos devuelven al inventario el stock que
// createReservedOrder reservó, y dejan el mismo tipo de InventoryLog
// ("liberacion"). Debe correr dentro de la transacción del caller: si el
// resto de esa transacción revierte, la liberación de stock revierte con ella.
async function releaseOrderStock(
  tx: Prisma.TransactionClient,
  order: { id: string; items: { variantId: string | null; quantity: number }[] },
) {
  for (const item of order.items) {
    if (!item.variantId) continue;
    // updateMany (no update): si la talla fue borrada después de la compra
    // (OrderItem.variant es SetNull), no hay nada que liberar.
    const result = await tx.productVariant.updateMany({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity } },
    });
    if (result.count === 0) continue;
    await logInventoryChange(tx, {
      variantId: item.variantId,
      reason: "liberacion",
      quantityChange: item.quantity,
      orderId: order.id,
    });
  }
}

type OrderAddressInput = {
  fullName: string;
  whatsapp: string;
  email: string;
  addressLine: string;
  addressType: AddressType;
  city: string;
  state: string;
  zip: string;
};

export async function createReservedOrder(params: {
  userId: string;
  address: OrderAddressInput;
  paymentMethod: PaymentMethod;
}) {
  const cart = await getCartWithPricing({ userId: params.userId });
  if (cart.items.length === 0) throw new OrderError("Tu carrito está vacío.");

  const reservedUntil = new Date(Date.now() + RESERVATION_DAYS * 24 * 60 * 60 * 1000);
  const total = computeCartTotal(cart.subtotal, cart.shippingEstimate);

  return prisma.$transaction(async (tx) => {
    // Reclama el carrito primero, no al final: un DELETE guardado por userId
    // (único por Cart) es la sección crítica atómica que evita que dos
    // confirmaciones concurrentes del mismo carrito (doble clic, dos
    // pestañas) generen dos Order — la segunda transacción encuentra 0 filas
    // para borrar porque la primera ya se llevó el carrito, y aborta antes de
    // tocar stock o crear nada. Si esta transacción falla más abajo (stock
    // insuficiente, etc.), el rollback deshace también este DELETE.
    const claimed = await tx.cart.deleteMany({ where: { userId: params.userId } });
    if (claimed.count === 0) {
      throw new OrderError("Este pedido ya se procesó, o tu carrito ya no está disponible.");
    }

    for (const item of cart.items) {
      // getCartWithPricing es de solo lectura (para mostrar el carrito) y no
      // filtra productos desactivados como sí hace addToCart — antes de
      // cobrar por algo hay que revalidarlo aquí.
      if (!item.productActive) {
        throw new OrderError(`"${item.productName}" ya no está disponible.`);
      }
      if (!item.variantId) continue;

      // updateMany con el stock en el WHERE: el propio UPDATE es la sección
      // crítica atómica — evita la carrera de leer-y-luego-escribir entre dos
      // checkouts simultáneos disputando la última unidad de una talla.
      const result = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count === 0) {
        throw new OrderError(
          `Ya no hay suficiente stock de "${item.productName}"` +
            `${item.variantSize ? ` (talla ${item.variantSize})` : ""}.`,
        );
      }
    }

    const order = await tx.order.create({
      data: {
        userId: params.userId,
        pricingTier: cart.useWholesalePrice ? "mayorista" : "individual",
        paymentMethod: params.paymentMethod,
        subtotal: cart.subtotal,
        shippingCost: cart.shippingEstimate,
        total,
        ...params.address,
        // Se regenera aquí, no se toma del query string que trae el checkout
        // (ver sección "Checkout" de CLAUDE.md): ese valor es editable por el
        // cliente y no es una fuente confiable de consentimiento legal.
        termsAcceptedAt: new Date(),
        reservedUntil,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantSize: item.variantSize,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        },
      },
    });

    // Después de crear el pedido, no antes: cada InventoryLog referencia
    // orderId, así que necesita el id ya asignado.
    for (const item of cart.items) {
      if (!item.variantId) continue;
      await logInventoryChange(tx, {
        variantId: item.variantId,
        reason: "reserva",
        quantityChange: -item.quantity,
        orderId: order.id,
      });
    }

    return order;
  });
}

// Corre desde el cron del ticket #28 (src/app/api/cron/expire-orders/route.ts).
// Un pedido reservado sin pago verificado en RESERVATION_DAYS pasa a "vencido"
// y su stock reservado se libera — el propio índice (status, reservedUntil)
// del schema existe para esta consulta.
export async function expireReservedOrders() {
  const expiredOrders = await prisma.order.findMany({
    where: { status: "reservado", reservedUntil: { lt: new Date() } },
    select: { id: true, items: { select: { variantId: true, quantity: true } } },
  });

  let expiredCount = 0;

  for (const order of expiredOrders) {
    try {
      const expired = await prisma.$transaction(async (tx) => {
        // updateMany guardado por status, no un update por id: si dos corridas
        // del cron se solapan (o esta consulta trae el mismo pedido dos veces
        // por un reintento), la segunda encuentra 0 filas en estado "reservado"
        // y no repite la liberación de stock — mismo patrón atómico que el
        // "reclamo" del carrito en createReservedOrder.
        const claimed = await tx.order.updateMany({
          where: { id: order.id, status: "reservado" },
          data: { status: "vencido" },
        });
        if (claimed.count === 0) return false;

        await releaseOrderStock(tx, order);
        return true;
      });
      if (expired) expiredCount++;
    } catch (error) {
      // Un pedido con problemas (fila bloqueada, error transitorio) no debe
      // detener el resto del lote — los que ya expiraron en esta corrida se
      // quedan así (transacciones independientes), y este se reintenta en la
      // siguiente corrida del cron (sigue "reservado" hasta que se reclame).
      console.error(`expireReservedOrders: fallo al expirar el pedido ${order.id}`, error);
    }
  }

  return { expiredCount };
}

// Historial de pedidos del cliente — a diferencia de listOrdersForAdmin, ya
// viene filtrado por userId (el cliente nunca ve pedidos ajenos).
export function listOrdersForCustomer(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, total: true, createdAt: true },
  });
}

// findUnique con un id sin forma de UUID revienta con un error crudo de
// Postgres antes de llegar al chequeo de dueño — mismo cuidado que
// getAddressForEdit (address-service.ts).
export async function getOrderForCustomer(userId: string, id: string) {
  if (!isUuid(id)) return null;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order || order.userId !== userId) return null;
  return order;
}

// Sin chequeo de dueño (a diferencia de getOrderForCustomer): el admin puede
// ver cualquier pedido. Mismo cuidado con isUuid antes de golpear Postgres.
export async function getOrderForAdmin(id: string) {
  if (!isUuid(id)) return null;
  return prisma.order.findUnique({ where: { id }, include: { items: true } });
}

export function listOrdersForAdmin(status?: OrderStatus) {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      fullName: true,
      total: true,
      paymentMethod: true,
      createdAt: true,
    },
  });
}

// Todos los estados con conteo, incluso en 0 — el dashboard necesita mostrar
// las 5 columnas siempre, no solo las que tengan pedidos.
export async function getOrderStatusCounts(): Promise<Record<OrderStatus, number>> {
  const counts = await prisma.order.groupBy({ by: ["status"], _count: true });
  const result: Record<OrderStatus, number> = {
    reservado: 0,
    confirmado: 0,
    enviado: 0,
    cancelado: 0,
    vencido: 0,
  };
  for (const row of counts) result[row.status] = row._count;
  return result;
}

export function listRecentOrders(limit = 10) {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, status: true, fullName: true, total: true, createdAt: true },
  });
}

// Cambio manual de estado desde /admin/pedidos. A diferencia de
// createReservedOrder/expireReservedOrders (que reclaman con un WHERE
// guardado por el estado ORIGEN antes de mutar), aquí el estado origen ya se
// valida arriba contra ALLOWED_MANUAL_TRANSITIONS — el updateMany igual usa
// ese mismo WHERE como sección crítica atómica contra dos admins cambiando el
// mismo pedido a la vez (dos pestañas, doble clic).
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  if (!isUuid(orderId)) throw new OrderError("Pedido no encontrado.");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { select: { variantId: true, quantity: true } } },
  });
  if (!order) throw new OrderError("Pedido no encontrado.");

  const allowed = getAllowedNextStatuses(order.status);
  if (!allowed.includes(newStatus)) {
    throw new OrderError(
      `No se puede pasar un pedido de "${order.status}" a "${newStatus}".`,
    );
  }

  await prisma.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: orderId, status: order.status },
      data: { status: newStatus },
    });
    if (claimed.count === 0) {
      throw new OrderError("Este pedido ya fue actualizado por otra persona. Recarga la página.");
    }

    // confirmado/enviado no mueven stock: ya se descontó en la reserva
    // (createReservedOrder) y se mantiene descontado mientras el pedido no se
    // cancele o venza. Solo cancelado libera lo reservado.
    if (newStatus === "cancelado") {
      await releaseOrderStock(tx, order);
    }
  });
}

// Copy de "siguientes pasos" para la pantalla de confirmación (ticket #29).
// Los pasos reales de pago con tarjeta (Stripe, ticket #31) y de pago manual
// (instrucciones desde PaymentMethodConfig, ticket #33) todavía no existen —
// este texto es un placeholder honesto ("te avisaremos") que esas tickets
// reemplazan, no una promesa de una función ya construida.
export function getOrderStatusMessage(status: OrderStatus, paymentMethod: PaymentMethod) {
  switch (status) {
    case "reservado": {
      if (paymentMethod === "tarjeta") {
        return {
          title: "Pedido reservado",
          description:
            "Tu pedido está reservado por 3 días. Pronto habilitaremos el pago en línea con tarjeta — te avisaremos para completarlo.",
        };
      }
      // Fallback al valor crudo del enum si algún día PAYMENT_METHOD_OPTIONS
      // (ticket #36, lista dinámica) no cubre un método — nunca mostrar "undefined".
      const label =
        PAYMENT_METHOD_OPTIONS.find((option) => option.value === paymentMethod)?.label ??
        paymentMethod;
      return {
        title: "Pedido reservado",
        description:
          `Tu pedido está reservado por 3 días. Te contactaremos con los datos para pagar por ${label} ` +
          "— nuestro equipo verifica los pagos manuales antes de confirmar el pedido.",
      };
    }
    case "confirmado":
      return {
        title: "Pago confirmado",
        description: "Verificamos tu pago. Estamos preparando tu pedido para el envío.",
      };
    case "enviado":
      return { title: "Pedido enviado", description: "Tu pedido ya está en camino." };
    case "vencido":
      return {
        title: "Reserva vencida",
        description: "La reserva de este pedido venció sin un pago verificado.",
      };
    case "cancelado":
      return { title: "Pedido cancelado", description: "Este pedido fue cancelado." };
    default: {
      // Chequeo de exhaustividad: si OrderStatus gana un valor nuevo (ticket
      // #35 y en adelante), esto deja de compilar hasta agregar su caso.
      const unhandled: never = status;
      throw new Error(`Estado de pedido no manejado: ${unhandled}`);
    }
  }
}
