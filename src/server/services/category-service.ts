import { prisma } from "@/lib/prisma";
import { ADMIN_PAGE_SIZE } from "@/lib/utils";

export class CategoryError extends Error {}

const hasActiveProducts = { products: { some: { active: true } } };

export function categoryLabel(category: { name: string; parent?: { name: string } | null }) {
  return category.parent ? `${category.parent.name} › ${category.name}` : category.name;
}

// Filtro de productos por categoría que incluye los de sus subcategorías:
// filtrar por "Zapatos" también trae los de "Zapatos › Mujer".
export function productInCategory(where: { id: string } | { slug: string }) {
  return { OR: [{ category: where }, { category: { parent: where } }] };
}

// Sin paginar: la usan los <select> de categoría (producto, reportes), que
// necesitan la lista completa. Cada padre va seguido de sus subcategorías.
export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { parent: { select: { name: true } }, _count: { select: { products: true } } },
  });
  const roots = categories.filter((category) => !category.parentId);
  return roots
    .flatMap((root) => [root, ...categories.filter((category) => category.parentId === root.id)])
    .map((category) => ({ ...category, label: categoryLabel(category) }));
}

export function listParentCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export async function listCategoriesAdmin({ search, page = 1 }: { search?: string; page?: number }) {
  const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};
  const [items, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        parent: { select: { name: true } },
        _count: { select: { products: true, children: true } },
      },
      skip: (Math.max(page, 1) - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.category.count({ where }),
  ]);
  return { items, total };
}

// Solo categorías principales, contando productos activos propios + los de
// sus subcategorías. Prisma no ordena por un `_count` filtrado, así que el
// ranking se hace en JS; `take` acota los candidatos, no el resultado.
export async function listFeaturedCategories(limit = 6) {
  const activeCount = { _count: { select: { products: { where: { active: true } } } } };
  const categories = await prisma.category.findMany({
    where: { parentId: null, OR: [hasActiveProducts, { children: { some: hasActiveProducts } }] },
    include: { ...activeCount, children: { select: activeCount } },
    take: Math.max(limit * 5, 50),
  });

  return categories
    .map((category) => ({
      ...category,
      productCount:
        category._count.products +
        category.children.reduce((sum, child) => sum + child._count.products, 0),
    }))
    .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name))
    .slice(0, limit);
}

// Árbol para la navegación de la tienda: categorías principales con productos
// activos (propios o de alguna subcategoría) y, dentro, solo las
// subcategorías que tienen productos activos.
export function listShopCategories() {
  return prisma.category.findMany({
    where: { parentId: null, OR: [hasActiveProducts, { children: { some: hasActiveProducts } }] },
    orderBy: { name: "asc" },
    include: { children: { where: hasActiveProducts, orderBy: { name: "asc" } } },
  });
}

type CategoryInput = {
  name: string;
  slug: string;
  parentId: string | null;
};

async function assertSlugAvailable(slug: string, excludeId?: string) {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw new CategoryError("Ya existe una categoría con ese slug.");
  }
}

async function assertValidParent(parentId: string | null, categoryId?: string) {
  if (!parentId) return;
  if (parentId === categoryId) {
    throw new CategoryError("Una categoría no puede ser su propia categoría principal.");
  }
  const parent = await prisma.category.findUnique({ where: { id: parentId } });
  if (!parent) throw new CategoryError("La categoría principal no existe.");
  if (parent.parentId) {
    throw new CategoryError("Solo se permite un nivel: elige una categoría principal, no una subcategoría.");
  }
  if (categoryId && (await prisma.category.count({ where: { parentId: categoryId } })) > 0) {
    throw new CategoryError("Esta categoría tiene subcategorías, no puede convertirse en subcategoría.");
  }
}

export async function createCategory(data: CategoryInput) {
  await Promise.all([assertSlugAvailable(data.slug), assertValidParent(data.parentId)]);
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: CategoryInput) {
  await Promise.all([assertSlugAvailable(data.slug, id), assertValidParent(data.parentId, id)]);
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  const [productCount, childCount] = await Promise.all([
    prisma.product.count({ where: { categoryId: id } }),
    prisma.category.count({ where: { parentId: id } }),
  ]);
  if (productCount > 0) {
    throw new CategoryError(
      `No se puede eliminar: tiene ${productCount} producto(s) asociado(s). Reasigna o elimina esos productos primero.`,
    );
  }
  if (childCount > 0) {
    throw new CategoryError(
      `No se puede eliminar: tiene ${childCount} subcategoría(s). Elimínalas o muévelas primero.`,
    );
  }
  await prisma.category.delete({ where: { id } });
}
