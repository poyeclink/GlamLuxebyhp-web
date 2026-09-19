import { prisma } from "@/lib/prisma";
import { ADMIN_PAGE_SIZE } from "@/lib/utils";

export class CategoryError extends Error {}

// Sin paginar: la usan los <select> de categoría (nuevo/editar producto), que
// necesitan la lista completa, no una página. listCategoriesAdmin (abajo) es
// la versión con búsqueda/paginación para /admin/categorias.
export function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function listCategoriesAdmin({ search, page = 1 }: { search?: string; page?: number }) {
  const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};
  const [items, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
      skip: (Math.max(page, 1) - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.category.count({ where }),
  ]);
  return { items, total };
}

// Counts only active products, unlike listCategories (which counts all of
// them for the admin list) — the two intentionally differ, don't merge them.
export async function listFeaturedCategories(limit = 6) {
  // Prisma can't combine a filtered `_count` (active products only) with an
  // `orderBy` on that same filtered count, so the ranking happens in JS.
  // `take` caps the candidate set fetched, not the final result — kept
  // generous relative to `limit` so the top categories are never cut off
  // before sorting.
  const categories = await prisma.category.findMany({
    where: { products: { some: { active: true } } },
    include: { _count: { select: { products: { where: { active: true } } } } },
    take: Math.max(limit * 5, 50),
  });

  return categories
    .sort((a, b) => b._count.products - a._count.products || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function listShopCategories() {
  return prisma.category.findMany({
    where: { products: { some: { active: true } } },
    orderBy: { name: "asc" },
  });
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
