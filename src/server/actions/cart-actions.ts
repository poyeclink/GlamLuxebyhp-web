"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCustomer } from "@/lib/session";
import {
  CartError,
  addToCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/server/services/cart-service";

export type CartActionState = {
  error?: string;
};

const quantityField = z.coerce
  .number()
  .int()
  .min(1, "La cantidad debe ser al menos 1.")
  .max(9999, "La cantidad no puede superar 9999.");

const addToCartSchema = z.object({
  variantId: z.string().uuid().optional(),
  quantity: quantityField,
});

export async function addToCartAction(
  productId: string,
  _prevState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const session = await requireCustomer();

  const parsed = addToCartSchema.safeParse({
    variantId: formData.get("variantId") || undefined,
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await addToCart(session.userId, productId, parsed.data.variantId ?? null, parsed.data.quantity);
  } catch (error) {
    if (error instanceof CartError) return { error: error.message };
    throw error;
  }

  revalidatePath("/carrito");
  return {};
}

const quantitySchema = z.object({
  quantity: quantityField,
});

export async function updateCartItemQuantityAction(
  itemId: string,
  _prevState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const session = await requireCustomer();

  const parsed = quantitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await updateCartItemQuantity(session.userId, itemId, parsed.data.quantity);
  } catch (error) {
    if (error instanceof CartError) return { error: error.message };
    throw error;
  }

  revalidatePath("/carrito");
  return {};
}

export async function removeCartItemAction(
  itemId: string,
  _prevState: CartActionState,
): Promise<CartActionState> {
  const session = await requireCustomer();

  try {
    await removeCartItem(session.userId, itemId);
  } catch (error) {
    if (error instanceof CartError) return { error: error.message };
    throw error;
  }

  revalidatePath("/carrito");
  return {};
}
