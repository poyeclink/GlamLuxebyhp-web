import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveShippingCost } from "@/server/services/shipping-service";

export class CartError extends Error {}

// Un carrito es de un User autenticado o de un invitado (cookie opaca,
// src/lib/cart-session.ts) — nunca ambos, reforzado por el CHECK de la
// migración guest_cart_session_token.
export type CartOwner = { userId: string } | { sessionToken: string };

// Único lugar con esta fórmula: la usan tanto CartTotals (para mostrar el
// carrito/checkout) como order-service.ts (para el Order.total persistido) —
// que ambos deriven de aquí evita que un cambio futuro (ej. envío gratis)
// se aplique en la UI pero no en lo que de verdad se cobra.
export function computeCartTotal(subtotal: number, shippingEstimate: number | null) {
  return subtotal + (shippingEstimate ?? 0);
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function cartWhereForOwner(owner: CartOwner) {
  return "userId" in owner ? { userId: owner.userId } : { sessionToken: owner.sessionToken };
}

function cartBelongsToOwner(
  cart: { userId: string | null; sessionToken: string | null },
  owner: CartOwner,
) {
  return "userId" in owner ? cart.userId === owner.userId : cart.sessionToken === owner.sessionToken;
}

async function getOrCreateCart(owner: CartOwner) {
  // upsert en vez de find-then-create: dos "agregar al carrito" simultáneos del
  // mismo dueño (usuario o invitado) no deben pisarse (userId/sessionToken son únicos).
  const where = cartWhereForOwner(owner);
  return prisma.cart.upsert({ where, create: owner, update: {} });
}

async function assertVariantAvailable(productId: string, variantId: string) {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant || variant.productId !== productId) {
    throw new CartError("La talla seleccionada no es válida para este producto.");
  }
  if (variant.soldOut) throw new CartError("Esta talla está agotada.");
}

export async function addToCart(
  owner: CartOwner,
  productId: string,
  variantId: string | null,
  quantity: number,
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) {
    throw new CartError("Este producto ya no está disponible.");
  }

  // Un producto sin tallas puede conservar filas viejas de ProductVariant:
  // nunca se guarda una de esas en el carrito.
  if (!product.hasVariants) variantId = null;

  if (product.hasVariants) {
    if (!variantId) throw new CartError("Selecciona una talla.");
    await assertVariantAvailable(productId, variantId);
  } else if (product.soldOut) {
    throw new CartError("Este producto está agotado.");
  }

  const cart = await getOrCreateCart(owner);

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, variantId },
  });

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  }

  try {
    return await prisma.cartItem.create({
      data: { cartId: cart.id, productId, variantId, quantity },
    });
  } catch (error) {
    // Doble clic/doble pestaña puede colar dos inserciones entre el findFirst y
    // este create; el índice único (cartId, productId, variantId) rechaza el
    // segundo — lo convertimos en un incremento de cantidad en vez de un error.
    if (!isUniqueConstraintError(error)) throw error;
    const existing = await prisma.cartItem.findFirstOrThrow({
      where: { cartId: cart.id, productId, variantId },
    });
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  }
}

async function getOwnedCartItem(owner: CartOwner, itemId: string) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });
  if (!item || !cartBelongsToOwner(item.cart, owner)) {
    throw new CartError("Este artículo no pertenece a tu carrito.");
  }
  return item;
}

export async function updateCartItemQuantity(owner: CartOwner, itemId: string, quantity: number) {
  await getOwnedCartItem(owner, itemId);
  return prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
}

export async function removeCartItem(owner: CartOwner, itemId: string) {
  const item = await getOwnedCartItem(owner, itemId);
  await prisma.cartItem.delete({ where: { id: item.id } });
}

export async function getCartItemCount(owner: CartOwner) {
  const cart = await prisma.cart.findUnique({
    where: cartWhereForOwner(owner),
    include: { items: { select: { quantity: true } } },
  });
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

export async function getCartWithPricing(owner: CartOwner) {
  const cart = await prisma.cart.findUnique({
    where: cartWhereForOwner(owner),
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
          },
          variant: true,
        },
      },
    },
  });

  const rawItems = cart?.items ?? [];
  const totalQuantity = rawItems.reduce((sum, item) => sum + item.quantity, 0);

  const items = rawItems.map((item) => {
    const unitPrice = Number(item.product.individualPrice);
    return {
      id: item.id,
      productId: item.productId,
      productActive: item.product.active,
      // Para el cliente, desactivado o con una línea que ya no calza con las
      // tallas del producto (updateProduct las limpia) es lo mismo que agotado.
      soldOut:
        !item.product.active ||
        (item.product.hasVariants
          ? (item.variant?.soldOut ?? true)
          : item.variantId !== null || item.product.soldOut),
      variantId: item.variantId,
      productName: item.product.name,
      variantSize: item.variant?.size ?? null,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      imageKey: item.product.images[0]?.key ?? null,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const shippingEstimate = totalQuantity === 0 ? 0 : await resolveShippingCost(totalQuantity);

  // El checkout no deja avanzar mientras haya algo que no se puede comprar.
  const hasUnavailable = items.some((item) => item.soldOut);

  return { items, totalQuantity, subtotal, shippingEstimate, hasUnavailable };
}

export async function mergeGuestCartIntoUser(sessionToken: string, userId: string) {
  const guestCart = await prisma.cart.findUnique({
    where: { sessionToken },
    include: { items: true },
  });
  if (!guestCart) return;

  // Se borra antes de fusionar (no después): addToCart no es idempotente
  // (suma cantidades), así que si algo falla a mitad del loop de abajo, un
  // reintento del login no debe volver a encontrar este carrito y duplicar
  // las líneas que ya se fusionaron — perder lo que faltaba es preferible a
  // duplicar cantidades ya cobradas/mostradas.
  await prisma.cart.delete({ where: { id: guestCart.id } });

  for (const item of guestCart.items) {
    try {
      await addToCart({ userId }, item.productId, item.variantId, item.quantity);
    } catch (error) {
      // Producto desactivado o agotado desde que se agregó como
      // invitado: se descarta esa línea en vez de bloquear el login.
      if (!(error instanceof CartError)) throw error;
    }
  }
}
