import { prisma } from "@/lib/prisma";
import type { AddressType, OrderStatus, PaymentMethod } from "@/generated/prisma/client";
import {
  CartError,
  addToCart,
  computeCartTotal,
  getCartWithPricing,
} from "@/server/services/cart-service";
import { ADMIN_PAGE_SIZE, isUuid } from "@/lib/utils";

export class OrderError extends Error {}

// El pago es inmediato: el pedido queda pendiente solo mientras el cliente
// está en la página de Stripe. Stripe exige que una sesión dure al menos
// 30 min, y la sesión vence a la vez que el pedido (createCardCheckoutUrl).
export const PAYMENT_WINDOW_MINUTES = 32;

// Badge/label de OrderStatus centralizados aquí: antes de esto, cada página
// que renderizaba un pedido (dashboard, lista admin, detalle admin, detalle
// del cliente) redeclaraba el mismo Record<OrderStatus, ...> por separado.
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  reservado: "Pago pendiente",
  confirmado: "Confirmado",
  enviado: "Enviado",
  cancelado: "Cancelado",
  vencido: "Pago no completado",
};

export const ORDER_STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  "accent" | "secondary" | "default" | "destructive"
> = {
  reservado: "accent",
  confirmado: "default",
  enviado: "secondary",
  vencido: "destructive",
  cancelado: "destructive",
};

// Transiciones manuales que el admin puede disparar desde /admin/pedidos.
// "confirmado" no es manual: solo lo pone el webhook de Stripe al cobrar.
// "vencido" lo pone Stripe (sesión vencida) o el cron de respaldo.
const ALLOWED_MANUAL_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  reservado: ["cancelado"],
  confirmado: ["enviado", "cancelado"],
  enviado: [],
  cancelado: [],
  vencido: [],
};

export function getAllowedNextStatuses(status: OrderStatus): OrderStatus[] {
  return ALLOWED_MANUAL_TRANSITIONS[status];
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
  locale: "es" | "en";
}) {
  const cart = await getCartWithPricing({ userId: params.userId });
  if (cart.items.length === 0) throw new OrderError("Tu carrito está vacío.");

  // getCartWithPricing es de solo lectura (para mostrar el carrito) y no
  // filtra productos desactivados ni agotados como sí hace addToCart — antes
  // de cobrar por algo hay que revalidarlo aquí.
  for (const item of cart.items) {
    if (!item.productActive) {
      throw new OrderError(`"${item.productName}" ya no está disponible.`);
    }
    if (item.soldOut) {
      throw new OrderError(
        `"${item.productName}"${item.variantSize ? ` (talla ${item.variantSize})` : ""} está agotado.`,
      );
    }
  }

  const reservedUntil = new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60 * 1000);
  const total = computeCartTotal(cart.subtotal, cart.shippingEstimate);

  return prisma.$transaction(
    async (tx) => {
      // Reclama el carrito primero, no al final: un DELETE guardado por userId
      // (único por Cart) es la sección crítica atómica que evita que dos
      // confirmaciones concurrentes del mismo carrito (doble clic, dos
      // pestañas) generen dos Order — la segunda transacción encuentra 0 filas
      // para borrar porque la primera ya se llevó el carrito, y aborta antes de
      // crear nada. Si el create de abajo falla, el rollback deshace también
      // este DELETE.
      const claimed = await tx.cart.deleteMany({ where: { userId: params.userId } });
      if (claimed.count === 0) {
        throw new OrderError("Este pedido ya se procesó, o tu carrito ya no está disponible.");
      }

      return tx.order.create({
        data: {
          userId: params.userId,
          pricingTier: "individual",
          paymentMethod: params.paymentMethod,
          locale: params.locale,
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
    },
    // Son solo dos consultas, pero el límite por defecto de Prisma (5 s) se
    // pasó en un pico de red y el cliente vio un error 500 al pagar.
    { timeout: 15_000 },
  );
}

// Pedido que no se pagó (el cliente canceló, venció la sesión de Stripe, o el
// admin lo canceló): devuelve las piezas al carrito del cliente para que
// pueda volver a intentarlo. El updateMany guardado por "reservado" es la
// sección crítica: el webhook de Stripe y el cron pueden llegar a la vez y
// solo uno las devuelve.
export async function releaseUnpaidOrder(orderId: string, status: "cancelado" | "vencido") {
  if (!isUuid(orderId)) return false;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { select: { productId: true, variantId: true, quantity: true } } },
  });
  if (!order || order.status !== "reservado") return false;

  const claimed = await prisma.order.updateMany({
    where: { id: orderId, status: "reservado" },
    data: { status },
  });
  if (claimed.count === 0) return false;
  if (!order.userId) return true;

  for (const item of order.items) {
    if (!item.productId) continue;
    // Un producto desactivado o agotado simplemente no vuelve al carrito.
    await addToCart({ userId: order.userId }, item.productId, item.variantId, item.quantity).catch(
      (error) => {
        if (!(error instanceof CartError)) throw error;
      },
    );
  }
  return true;
}

// Un pedido pendiente se puede retomar en Stripe hasta que vence: si mientras
// tanto la clienta marcó una pieza agotada (o la desactivó), ya no se cobra.
export async function orderHasUnavailableItems(orderId: string) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    select: {
      product: { select: { active: true, hasVariants: true, soldOut: true } },
      variant: { select: { soldOut: true } },
    },
  });
  return items.some(
    ({ product, variant }) =>
      !product ||
      !product.active ||
      (product.hasVariants ? (variant?.soldOut ?? true) : product.soldOut),
  );
}

// Respaldo del cron por si el webhook "checkout.session.expired" de Stripe no
// llegó: la sesión de pago vence junto con reservedUntil.
export async function expireReservedOrders() {
  const expiredOrders = await prisma.order.findMany({
    where: { status: "reservado", reservedUntil: { lt: new Date() } },
    select: { id: true },
  });

  let expiredCount = 0;
  for (const order of expiredOrders) {
    try {
      if (await releaseUnpaidOrder(order.id, "vencido")) expiredCount++;
    } catch (error) {
      // Un pedido con problemas no detiene el lote: se reintenta en la próxima corrida.
      console.error(`expireReservedOrders: fallo al expirar el pedido ${order.id}`, error);
    }
  }
  return { expiredCount };
}

// Historial de pedidos del cliente — a diferencia de listOrdersForAdmin, ya
// viene filtrado por userId (el cliente nunca ve pedidos ajenos). Incluye
// _count.items solo para mostrar "N artículos" en la lista sin traer cada
// OrderItem completo.
export function listOrdersForCustomer(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
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

export async function listOrdersForAdmin({
  status,
  search,
  page = 1,
}: {
  status?: OrderStatus;
  search?: string;
  page?: number;
}) {
  const where = {
    ...(status ? { status } : {}),
    ...(search ? { fullName: { contains: search, mode: "insensitive" as const } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        fullName: true,
        total: true,
        paymentMethod: true,
        createdAt: true,
      },
      skip: (Math.max(page, 1) - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);
  return { items, total };
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

  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (!order) throw new OrderError("Pedido no encontrado.");

  const allowed = getAllowedNextStatuses(order.status);
  if (!allowed.includes(newStatus)) {
    throw new OrderError("Este pedido no admite ese cambio de estado.");
  }

  const claimed = await prisma.order.updateMany({
    where: { id: orderId, status: order.status },
    data: { status: newStatus },
  });
  if (claimed.count === 0) {
    throw new OrderError("Este pedido ya fue actualizado por otra persona. Recarga la página.");
  }
}

// Lo llama el webhook de Stripe. Mismo reclamo atómico guardado por estado
// que updateOrderStatus: Stripe reintenta y puede repetir eventos, y la
// segunda entrega encuentra 0 filas "reservado". false = el pedido ya no
// estaba reservado (repetido, o vencido/cancelado: ese cobro hay que
// reembolsarlo a mano desde Stripe).
export async function confirmCardPayment(orderId: string) {
  if (!isUuid(orderId)) return false;
  const { count } = await prisma.order.updateMany({
    where: { id: orderId, status: "reservado", paymentMethod: "tarjeta" },
    data: { status: "confirmado" },
  });
  return count > 0;
}

// Copy de "siguientes pasos" de /pedidos/[id] y de los correos de estado.
export function getOrderStatusMessage(status: OrderStatus) {
  switch (status) {
    case "reservado":
      return {
        title: "Pago pendiente",
        description:
          "Completa el pago con tarjeta para confirmar tu pedido. Si no lo completas, el pedido se cancela solo y las piezas vuelven a tu carrito.",
      };
    case "confirmado":
      return {
        title: "Pago confirmado",
        description: "Recibimos tu pago. Estamos preparando tu pedido para el envío.",
      };
    case "enviado":
      return { title: "Pedido enviado", description: "Tu pedido ya está en camino." };
    case "vencido":
      return {
        title: "Pago no completado",
        description:
          "El pago no se completó, así que el pedido se canceló y las piezas volvieron a tu carrito.",
      };
    case "cancelado":
      return { title: "Pedido cancelado", description: "Este pedido fue cancelado." };
    default: {
      // Chequeo de exhaustividad: si OrderStatus gana un valor nuevo, esto
      // deja de compilar hasta agregar su caso.
      const unhandled: never = status;
      throw new Error(`Estado de pedido no manejado: ${unhandled}`);
    }
  }
}
