import { prisma } from "@/lib/prisma";
import { ADMIN_PAGE_SIZE, isUuid } from "@/lib/utils";
import { sortVariantsBySize } from "@/server/services/product-service";

// Sin conteo de stock: cada producto (o cada talla) está Disponible o Agotado
// y la administradora lo cambia a mano. Las ventas no lo modifican.

export async function listProductAvailability({
  search,
  page = 1,
}: { search?: string; page?: number } = {}) {
  const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        active: true,
        hasVariants: true,
        soldOut: true,
        variants: { select: { id: true, size: true, soldOut: true } },
      },
      skip: (Math.max(page, 1) - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);
  return {
    items: products.map((product) => ({
      ...product,
      variants: sortVariantsBySize(product.variants),
    })),
    total,
  };
}

// Para el dashboard: lo que está agotado en la tienda (productos activos).
export async function listSoldOutItems(limit = 8) {
  const [products, variants] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, hasVariants: false, soldOut: true },
      orderBy: { name: "asc" },
      take: limit,
      select: { id: true, name: true },
    }),
    prisma.productVariant.findMany({
      where: { soldOut: true, product: { active: true, hasVariants: true } },
      orderBy: { product: { name: "asc" } },
      take: limit,
      select: { id: true, size: true, product: { select: { id: true, name: true } } },
    }),
  ]);
  return [
    ...products.map((product) => ({
      key: product.id,
      productId: product.id,
      name: product.name,
      size: null,
    })),
    // Tallas en su orden natural (S, M, L…) dentro de cada producto.
    ...sortVariantsBySize(variants)
      .sort((a, b) => a.product.name.localeCompare(b.product.name))
      .map((variant) => ({
        key: variant.id,
        productId: variant.product.id,
        name: variant.product.name,
        size: variant.size,
      })),
  ].slice(0, limit);
}

// updateMany: si se borró entre que se cargó la página y el toque, no hace nada.
export async function setProductSoldOut(productId: string, soldOut: boolean) {
  if (!isUuid(productId)) return;
  await prisma.product.updateMany({ where: { id: productId }, data: { soldOut } });
}

export async function setVariantSoldOut(variantId: string, soldOut: boolean) {
  if (!isUuid(variantId)) return;
  await prisma.productVariant.updateMany({ where: { id: variantId }, data: { soldOut } });
}
