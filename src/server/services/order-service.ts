import { prisma } from "@/lib/prisma";
import type { AddressType, OrderStatus, PaymentMethod } from "@/generated/prisma/client";
import { computeCartTotal, getCartWithPricing } from "@/server/services/cart-service";
import { PAYMENT_METHOD_OPTIONS } from "@/server/services/payment-service";
import { isUuid } from "@/lib/utils";

export class OrderError extends Error {}

const RESERVATION_DAYS = 3;

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

// InventoryLog (ticket #39) todavía no existe: este ticket solo descuenta
// stock de ProductVariant, sin dejar un registro de movimiento todavía. El
// ticket #39 es el que agrega ese log en este mismo punto.
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

    return tx.order.create({
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

        for (const item of order.items) {
          if (!item.variantId) continue;
          // updateMany (no update): si la talla fue borrada después de la
          // compra (OrderItem.variant es SetNull), no hay nada que liberar —
          // updateMany simplemente afecta 0 filas en vez de lanzar.
          await tx.productVariant.updateMany({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
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

// findUnique con un id sin forma de UUID revienta con un error crudo de
// Postgres antes de llegar al chequeo de dueño — mismo cuidado que
// getAddressForEdit (address-service.ts).
export async function getOrderForCustomer(userId: string, id: string) {
  if (!isUuid(id)) return null;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order || order.userId !== userId) return null;
  return order;
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
