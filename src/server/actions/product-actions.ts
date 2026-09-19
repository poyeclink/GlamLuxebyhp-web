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
import {
  ProductImageError,
  addProductImage,
  assertValidImageFile,
} from "@/server/services/product-image-service";
import { createVariant } from "@/server/services/product-variant-service";

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

const variantRowSchema = z.object({
  size: z.string().trim().min(1, "La talla no puede estar vacía."),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo."),
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
      if (error instanceof ProductImageError) return { error: error.message };
      throw error;
    }
  }

  // Input opcional "variantSize"/"variantStock" (pares por posición, ver
  // VariantSelector) — mismo criterio que las imágenes: se valida todo antes
  // de crear el producto, para que una talla repetida o un stock inválido no
  // dejen un producto creado a medias.
  const variantSizes = formData.getAll("variantSize").map(String);
  const variantStocks = formData.getAll("variantStock").map(String);
  const parsedVariants: { size: string; stock: number }[] = [];
  const seenSizes = new Set<string>();
  for (let i = 0; i < variantSizes.length; i++) {
    const parsedRow = variantRowSchema.safeParse({ size: variantSizes[i], stock: variantStocks[i] });
    if (!parsedRow.success) {
      return { error: parsedRow.error.issues[0]?.message ?? "Talla inválida." };
    }
    if (seenSizes.has(parsedRow.data.size)) {
      return { error: `La talla "${parsedRow.data.size}" está repetida.` };
    }
    seenSizes.add(parsedRow.data.size);
    parsedVariants.push(parsedRow.data);
  }

  let product;
  try {
    product = await createProduct(parsed.data);
  } catch (error) {
    if (error instanceof ProductError) return { error: error.message };
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

  for (const variant of parsedVariants) {
    try {
      await createVariant(product.id, variant);
    } catch {
      creationPartiallyFailed = true;
      break;
    }
  }

  revalidatePath("/admin/productos");
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
