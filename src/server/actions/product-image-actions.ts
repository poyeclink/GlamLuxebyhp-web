"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import {
  ProductImageError,
  addProductImage,
  deleteProductImage,
  replaceProductImage,
  setPrimaryProductImage,
} from "@/server/services/product-image-service";

export type ProductImageActionState = {
  error?: string;
};

export async function uploadProductImageAction(
  productId: string,
  _prevState: ProductImageActionState,
  formData: FormData,
): Promise<ProductImageActionState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen." };
  }

  try {
    await addProductImage(productId, file);
  } catch (error) {
    if (error instanceof ProductImageError) return { error: error.message };
    throw error;
  }

  revalidatePath(`/admin/productos/${productId}`);
  return {};
}

export async function replaceProductImageAction(
  imageId: string,
  productId: string,
  _prevState: ProductImageActionState,
  formData: FormData,
): Promise<ProductImageActionState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen." };
  }

  try {
    await replaceProductImage(imageId, file);
  } catch (error) {
    if (error instanceof ProductImageError) return { error: error.message };
    throw error;
  }

  revalidatePath(`/admin/productos/${productId}`);
  return {};
}

export async function deleteProductImageAction(imageId: string, productId: string) {
  await requireAdmin();
  await deleteProductImage(imageId);
  revalidatePath(`/admin/productos/${productId}`);
}

export async function setPrimaryProductImageAction(imageId: string, productId: string) {
  await requireAdmin();
  await setPrimaryProductImage(imageId);
  revalidatePath(`/admin/productos/${productId}`);
}
