"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import {
  CategoryError,
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/server/services/category-service";

export type CategoryActionState = {
  error?: string;
};

const categorySchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "El slug solo puede tener minúsculas, números y guiones."),
});

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await createCategory(parsed.data);
  } catch (error) {
    if (error instanceof CategoryError) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function updateCategoryAction(
  id: string,
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await updateCategory(id, parsed.data);
  } catch (error) {
    if (error instanceof CategoryError) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function deleteCategoryAction(
  id: string,
  _prevState: CategoryActionState,
): Promise<CategoryActionState> {
  await requireAdmin();

  try {
    await deleteCategory(id);
  } catch (error) {
    if (error instanceof CategoryError) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/categorias");
  return {};
}
