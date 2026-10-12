"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { getAdminT } from "@/lib/i18n";
import {
  ProductError,
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/server/services/product-service";
import {
  ProductImageError,
  addProductImage,
  assertValidImageFile,
} from "@/server/services/product-image-service";
import { createVariant } from "@/server/services/product-variant-service";
import { SHOP_CATEGORIES_TAG } from "@/server/services/category-service";

export type ProductActionState = {
  error?: string;
  success?: boolean;
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
  individualPrice: z.coerce.number().positive("El precio debe ser mayor a 0."),
  boxed: z.coerce.boolean().optional().default(false),
  hasVariants: z.coerce.boolean().optional().default(false),
  active: z.coerce.boolean().optional().default(false),
  soldOut: z.coerce.boolean().optional().default(false),
});

export async function createProductAction(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();
  const t = await getAdminT();

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: t(parsed.error.issues[0]?.message ?? "Datos inválidos.") };
  }

  // Input opcional "images" (multiple) del formulario de creación — a
  // diferencia de ProductImageUploader (edición), acá no hay un productId
  // todavía para subir a R2 en cuanto se elige el archivo, así que se valida
  // antes de crear nada y se sube recién después. Se pre-valida formato/tamaño
  // antes de tocar la base de datos: si una imagen es inválida, no debe
  // quedar un producto creado sin ellas por un error a mitad de camino.
  const imageFiles = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  for (const file of imageFiles) {
    try {
      assertValidImageFile(file);
    } catch (error) {
      if (error instanceof ProductImageError) return { error: t(error.message) };
      throw error;
    }
  }

  // Input opcional "variantSize" (ver VariantSelector) — mismo criterio que
  // las imágenes: se valida todo antes de crear el producto, para que una
  // talla vacía o repetida no deje un producto creado a medias.
  const variantSizes = formData.getAll("variantSize").map((size) => String(size).trim());
  const seenSizes = new Set<string>();
  for (const size of variantSizes) {
    if (!size) return { error: t("La talla no puede estar vacía.") };
    if (seenSizes.has(size.toLowerCase())) {
      return { error: t('La talla "{size}" está repetida.', { size }) };
    }
    seenSizes.add(size.toLowerCase());
  }

  let product;
  try {
    product = await createProduct(parsed.data);
  } catch (error) {
    if (error instanceof ProductError) return { error: t(error.message) };
    throw error;
  }

  // El producto ya está creado en este punto — un fallo de infraestructura acá
  // (R2/red, o una condición de carrera improbable en las tallas) no debe
  // tumbar la acción sin control: el admin quedaría sin saber que el producto
  // sí se creó, y un reintento del mismo formulario chocaría con el slug ya
  // existente. Mejor seguir a la página de editar, donde ProductImageUploader
  // y VariantManager dejan terminar de cargar lo que faltó.
  let creationPartiallyFailed = false;
  for (const file of imageFiles) {
    try {
      await addProductImage(product.id, file);
    } catch {
      creationPartiallyFailed = true;
      break;
    }
  }

  for (const size of variantSizes) {
    try {
      await createVariant(product.id, { size });
    } catch {
      creationPartiallyFailed = true;
      break;
    }
  }

  revalidatePath("/admin/productos");
  updateTag(SHOP_CATEGORIES_TAG);
  if (creationPartiallyFailed) {
    revalidatePath(`/admin/productos/${product.id}/editar`);
    redirect(`/admin/productos/${product.id}/editar`);
  }
  redirect("/admin/productos");
}

export async function updateProductAction(
  id: string,
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();
  const t = await getAdminT();

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: t(parsed.error.issues[0]?.message ?? "Datos inválidos.") };
  }

  try {
    await updateProduct(id, parsed.data);
  } catch (error) {
    if (error instanceof ProductError) return { error: t(error.message) };
    throw error;
  }

  // Sin redirect: la administradora sigue en la página de editar.
  revalidatePath("/admin/productos");
  updateTag(SHOP_CATEGORIES_TAG);
  revalidatePath(`/admin/productos/${id}/editar`);
  return { success: true };
}

export async function deleteProductAction(
  id: string,
  _prevState: ProductActionState,
): Promise<ProductActionState> {
  await requireAdmin();
  const t = await getAdminT();

  try {
    await deleteProduct(id);
  } catch (error) {
    if (error instanceof ProductError) return { error: t(error.message) };
    throw error;
  }

  revalidatePath("/admin/productos");
  updateTag(SHOP_CATEGORIES_TAG);
  return {};
}
