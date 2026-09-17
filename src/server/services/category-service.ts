import { prisma } from "@/lib/prisma";

export class CategoryError extends Error {}

export function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export function getCategory(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

type CategoryInput = {
  name: string;
  slug: string;
};

async function assertSlugAvailable(slug: string, excludeId?: string) {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw new CategoryError("Ya existe una categoría con ese slug.");
  }
}

export async function createCategory(data: CategoryInput) {
  await assertSlugAvailable(data.slug);
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: CategoryInput) {
  await assertSlugAvailable(data.slug, id);
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new CategoryError(
      `No se puede eliminar: tiene ${productCount} producto(s) asociado(s). Reasigna o elimina esos productos primero.`,
    );
  }
  await prisma.category.delete({ where: { id } });
}
