import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveShippingCost } from "@/server/services/shipping-service";

export class CartError extends Error {}

// Del PDF: umbral que activa precio mayorista automático en el carrito. Los
// ShippingRate del tier "individual" (prisma/seed.ts) deben cubrir hasta
// threshold-1 — si este número sube sin extender esas tarifas, el hueco
// resuelve a null ("se coordina aparte") en vez de dar un precio real.
const WHOLESALE_ITEM_THRESHOLD = 6;

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function getOrCreateCart(userId: string) {
  // upsert en vez de find-then-create: dos "agregar al carrito" simultáneos del
  // mismo usuario nuevo no deben pisarse (Cart.userId es único).
  return prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} });
}

async function assertVariantAvailable(productId: string, variantId: string, quantity: number) {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant || variant.productId !== productId) {
    throw new CartError("La talla seleccionada no es válida para este producto.");
  }
  if (variant.stock < quantity) {
    throw new CartError(`Solo quedan ${variant.stock} unidades de esta talla.`);
  }
  return variant;
}

export async function addToCart(
  userId: string,
  productId: string,
  variantId: string | null,
  quantity: number,
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) {
    throw new CartError("Este producto ya no está disponible.");
  }

  if (product.hasVariants) {
    if (!variantId) throw new CartError("Selecciona una talla.");
    await assertVariantAvailable(productId, variantId, quantity);
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, variantId },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (variantId) await assertVariantAvailable(productId, variantId, newQuantity);
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
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

async function getOwnedCartItem(userId: string, itemId: string) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== userId) {
    throw new CartError("Este artículo no pertenece a tu carrito.");
  }
  return item;
}

export async function updateCartItemQuantity(userId: string, itemId: string, quantity: number) {
  const item = await getOwnedCartItem(userId, itemId);
  if (item.variantId) await assertVariantAvailable(item.productId, item.variantId, quantity);
  return prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
}

export async function removeCartItem(userId: string, itemId: string) {
  const item = await getOwnedCartItem(userId, itemId);
  await prisma.cartItem.delete({ where: { id: item.id } });
}

export async function getCartItemCount(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { select: { quantity: true } } },
  });
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

export async function getCartWithPricing(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
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
  const useWholesalePrice = totalQuantity >= WHOLESALE_ITEM_THRESHOLD;

  const items = rawItems.map((item) => {
    const unitPrice = Number(
      useWholesalePrice ? item.product.wholesalePrice : item.product.individualPrice,
    );
    return {
      id: item.id,
      productName: item.product.name,
      variantSize: item.variant?.size ?? null,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      imageKey: item.product.images[0]?.key ?? null,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const shippingEstimate =
    totalQuantity === 0
      ? 0
      : await resolveShippingCost(useWholesalePrice ? "mayorista" : "individual", totalQuantity);

  return { items, totalQuantity, useWholesalePrice, subtotal, shippingEstimate };
}
