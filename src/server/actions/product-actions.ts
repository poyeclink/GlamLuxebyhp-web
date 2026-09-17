"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import {
  ProductError,
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/server/services/product-service";

export type ProductActionState = {
  error?: string;
};

const productSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "El slug solo puede tener minúsculas, números y guiones."),
  categoryId: z.string().uuid("Selecciona una categoría."),
  description: z.string().trim().min(1, "La descripción es obligatoria."),
  wholesalePrice: z.coerce.number().positive("El precio mayorista debe ser mayor a 0."),
  individualPrice: z.coerce.number().positive("El precio individual debe ser mayor a 0."),
  boxed: z.coerce.boolean().optional().default(false),
  hasVariants: z.coerce.boolean().optional().default(false),
  active: z.coerce.boolean().optional().default(false),
});

export async function createProductAction(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await createProduct(parsed.data);
  } catch (error) {
    if (error instanceof ProductError) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function updateProductAction(
  id: string,
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await updateProduct(id, parsed.data);
  } catch (error) {
    if (error instanceof ProductError) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${id}/editar`);
  redirect("/admin/productos");
}

export async function deleteProductAction(
  id: string,
  _prevState: ProductActionState,
): Promise<ProductActionState> {
  await requireAdmin();

  try {
    await deleteProduct(id);
  } catch (error) {
    if (error instanceof ProductError) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/productos");
  return {};
}
