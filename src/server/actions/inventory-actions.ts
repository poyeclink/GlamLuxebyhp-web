"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { setProductSoldOut, setVariantSoldOut } from "@/server/services/inventory-service";

// Agotar o reponer cambia la tienda, el inventario, el dashboard y la ficha
// del admin a la vez: se revalida todo el árbol.
export async function setProductSoldOutAction(productId: string, soldOut: boolean) {
  await requireAdmin();
  await setProductSoldOut(productId, soldOut);
  revalidatePath("/", "layout");
}

export async function setVariantSoldOutAction(variantId: string, soldOut: boolean) {
  await requireAdmin();
  await setVariantSoldOut(variantId, soldOut);
  revalidatePath("/", "layout");
}
