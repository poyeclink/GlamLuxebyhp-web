"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import {
  ProductVariantError,
  createVariant,
  deleteVariant,
  updateVariant,
} from "@/server/services/product-variant-service";

export type VariantActionState = {
  error?: string;
};

const variantSchema = z.object({
  size: z.string().trim().min(1, "La talla es obligatoria."),
  stock: z.coerce
    .number()
    .int("El stock debe ser un número entero.")
    .min(0, "El stock no puede ser negativo."),
});

export async function createVariantAction(
  productId: string,
  _prevState: VariantActionState,
  formData: FormData,
): Promise<VariantActionState> {
  await requireAdmin();

  const parsed = variantSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await createVariant(productId, parsed.data);
  } catch (error) {
    if (error instanceof ProductVariantError) return { error: error.message };
    throw error;
  }

  revalidatePath(`/admin/productos/${productId}/editar`);
  return {};
}

export async function updateVariantAction(
  id: string,
  productId: string,
  _prevState: VariantActionState,
  formData: FormData,
): Promise<VariantActionState> {
  await requireAdmin();

  const parsed = variantSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await updateVariant(id, parsed.data);
  } catch (error) {
    if (error instanceof ProductVariantError) return { error: error.message };
    throw error;
  }

  revalidatePath(`/admin/productos/${productId}/editar`);
  return {};
}

export async function deleteVariantAction(id: string, productId: string) {
  await requireAdmin();
  await deleteVariant(id);
  revalidatePath(`/admin/productos/${productId}/editar`);
}
