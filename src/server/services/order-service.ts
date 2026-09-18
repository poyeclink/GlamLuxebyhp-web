import { prisma } from "@/lib/prisma";
import type { AddressType, PaymentMethod } from "@/generated/prisma/client";
import { computeCartTotal, getCartWithPricing } from "@/server/services/cart-service";

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
