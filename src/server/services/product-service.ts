import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/server/services/product-image-service";
import { r2PublicUrl } from "@/lib/r2";
import { ADMIN_PAGE_SIZE } from "@/lib/utils";
import type { ProductCardItem } from "@/components/shop/ProductCard";
import { categoryLabel, productInCategory } from "@/server/services/category-service";

import { SHOP_PAGE_SIZE, type ShopFilters } from "@/lib/shop-filters";
import type { Prisma } from "@/generated/prisma/client";

const categoryWithParent = { include: { parent: true } } as const;

// Lo que necesita una ProductCard: principal primero y una segunda foto para
// el hover, más la disponibilidad de las tallas para marcar "Agotado".
const cardInclude = {
  category: categoryWithParent,
  images: {
    orderBy: [{ isPrimary: "desc" as const }, { position: "asc" as const }],
    take: 2,
  },
  variants: { select: { soldOut: true } },
} satisfies Prisma.ProductInclude;

const NEW_PRODUCT_DAYS = 21;

export class ProductError extends Error {}

// Sizes are a free-text column (no enum), so Prisma's `orderBy: { size: "asc" }`
// sorts lexicographically ("L" < "M" < "S", "10" < "2") — wrong for both letter
// and numeric sizes. Letter sizes go first in their known order, then numeric
// sizes ascending, then anything else alphabetically — groups never interleave,
// so a product mixing "M" and "38" still reads S, M, L, 38, 40.
const LETTER_SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function sizeRank(size: string): [group: number, value: number] {
  const letter = LETTER_SIZE_ORDER.indexOf(size.toUpperCase());
  if (letter !== -1) return [0, letter];
  const number = Number(size.replace(",", "."));
  if (size.trim() !== "" && !Number.isNaN(number)) return [1, number];
  return [2, 0];
}

function compareSizes(a: string, b: string) {
  const [groupA, valueA] = sizeRank(a);
  const [groupB, valueB] = sizeRank(b);
  return groupA - groupB || valueA - valueB || a.localeCompare(b);
}

export function sortVariantsBySize<T extends { size: string }>(variants: T[]) {
  return [...variants].sort((a, b) => compareSizes(a.size, b.size));
}

export async function listProducts({ search, page = 1 }: { search?: string; page?: number } = {}) {
  const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        category: categoryWithParent,
        images: { where: { isPrimary: true }, take: 1, select: { key: true } },
      },
      skip: (Math.max(page, 1) - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total };
}

export function listFeaturedProducts(
  limit = 8,
  { categoryId, excludeIds = [] }: { categoryId?: string; excludeIds?: string[] } = {},
) {
  return prisma.product.findMany({
    where: {
      active: true,
      id: { notIn: excludeIds },
      ...(categoryId ? productInCategory({ id: categoryId }) : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
    include: cardInclude,
  });
}

export function listShopProducts(categorySlug?: string) {
  return prisma.product.findMany({
    where: {
      active: true,
      ...(categorySlug ? productInCategory({ slug: categorySlug }) : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: cardInclude,
  });
}

const SHOP_ORDER_BY = {
  recientes: [{ createdAt: "desc" }, { id: "desc" }],
  "precio-asc": [{ individualPrice: "asc" }, { id: "desc" }],
  "precio-desc": [{ individualPrice: "desc" }, { id: "desc" }],
  nombre: [{ name: "asc" }, { id: "desc" }],
} satisfies Record<ShopFilters["orden"], Prisma.ProductOrderByWithRelationInput[]>;

const available: Prisma.ProductWhereInput = {
  OR: [
    { hasVariants: false, soldOut: false },
    { hasVariants: true, variants: { some: { soldOut: false } } },
  ],
};

// Con tallas, agotado = todas agotadas (o ninguna cargada); sin tallas, el
// flag del propio producto.
export function isProductSoldOut(product: {
  hasVariants: boolean;
  soldOut: boolean;
  variants: { soldOut: boolean }[];
}) {
  return product.hasVariants
    ? product.variants.every((variant) => variant.soldOut)
    : product.soldOut;
}

function categoryScope(filters: ShopFilters): Prisma.ProductWhereInput {
  return {
    active: true,
    ...(filters.categoria ? productInCategory({ slug: filters.categoria }) : {}),
  };
}

// "Ver más" acumula páginas (page=2 muestra 48) en vez de paginar: invita a
// seguir bajando sin perder lo que ya se vio.
export async function searchShopProducts(filters: ShopFilters) {
  const text = filters.q ? { contains: filters.q, mode: "insensitive" as const } : undefined;
  const where: Prisma.ProductWhereInput = {
    AND: [
      categoryScope(filters),
      text ? { OR: [{ name: text }, { description: text }, { category: { name: text } }] } : {},
      filters.min !== undefined || filters.max !== undefined
        ? { individualPrice: { gte: filters.min, lte: filters.max } }
        : {},
      filters.tallas.length > 0
        ? { hasVariants: true, variants: { some: { size: { in: filters.tallas }, soldOut: false } } }
        : {},
      filters.disponible ? available : {},
    ],
  };
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: SHOP_ORDER_BY[filters.orden],
      take: filters.page * SHOP_PAGE_SIZE,
      include: cardInclude,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total };
}

// Opciones de los filtros dentro de la categoría actual: tallas disponibles y
// rango de precios, para no ofrecer filtros que dan cero resultados.
export async function getShopFilterOptions(filters: ShopFilters) {
  const scope = categoryScope(filters);
  const [variants, prices] = await Promise.all([
    prisma.productVariant.findMany({
      where: { soldOut: false, product: { ...scope, hasVariants: true } },
      distinct: ["size"],
      select: { size: true },
    }),
    prisma.product.aggregate({
      where: scope,
      _min: { individualPrice: true },
      _max: { individualPrice: true },
    }),
  ]);
  return {
    sizes: sortVariantsBySize(variants).map((variant) => variant.size),
    minPrice: Math.floor(Number(prices._min.individualPrice ?? 0)),
    maxPrice: Math.ceil(Number(prices._max.individualPrice ?? 0)),
  };
}

type ProductForCard = {
  slug: string;
  name: string;
  individualPrice: unknown;
  createdAt: Date;
  hasVariants: boolean;
  soldOut: boolean;
  category: { name: string; parent: { name: string } | null };
  images: { key: string }[];
  variants: { soldOut: boolean }[];
};

export function toProductCardItem(product: ProductForCard): ProductCardItem {
  return {
    slug: product.slug,
    name: product.name,
    categoryName: categoryLabel(product.category),
    individualPrice: Number(product.individualPrice),
    imageUrl: product.images[0] ? r2PublicUrl(product.images[0].key) : null,
    hoverImageUrl: product.images[1] ? r2PublicUrl(product.images[1].key) : null,
    isNew: Date.now() - product.createdAt.getTime() < NEW_PRODUCT_DAYS * 86_400_000,
    soldOut: isProductSoldOut(product),
  };
}

// "Productos que te podrían interesar" en la página de detalle — mismos
// criterios que listShopProducts (activos, más recientes primero) pero
// prioriza la categoría del producto que se está viendo, excluyéndolo.
// Con catálogos chicos por categoría (común en las primeras etapas de la
// tienda) esa categoría sola no siempre alcanza para un carrusel — se
// completa con otros productos activos en vez de mostrar 1 solo resultado.
export async function listRelatedProducts(categoryId: string, excludeProductId: string, limit = 8) {
  const include = cardInclude;

  const sameCategory = await prisma.product.findMany({
    where: { active: true, categoryId, id: { not: excludeProductId } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
    include,
  });

  if (sameCategory.length >= limit) return sameCategory;

  const otherProducts = await prisma.product.findMany({
    where: {
      active: true,
      id: { notIn: [excludeProductId, ...sameCategory.map((product) => product.id)] },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit - sameCategory.length,
    include,
  });

  return [...sameCategory, ...otherProducts];
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { size: "asc" } },
      category: categoryWithParent,
    },
  });
  if (!product) return null;
  return { ...product, variants: sortVariantsBySize(product.variants) };
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { size: "asc" } },
      category: categoryWithParent,
    },
  });
  if (!product) return null;
  return { ...product, variants: sortVariantsBySize(product.variants) };
}

type ProductInput = {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  individualPrice: number;
  boxed: boolean;
  hasVariants: boolean;
  active: boolean;
  soldOut: boolean;
};

async function assertSlugAvailable(slug: string, excludeId?: string) {
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw new ProductError("Ya existe un producto con ese slug.");
  }
}

async function assertCategoryExists(categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new ProductError("La categoría seleccionada no existe.");
}

export async function createProduct(data: ProductInput) {
  await assertSlugAvailable(data.slug);
  await assertCategoryExists(data.categoryId);
  // Solo se vende al detalle, pero la columna wholesalePrice sigue siendo
  // obligatoria (y conserva los valores de los productos existentes por si
  // vuelve la venta mayorista): un producto nuevo la llena con su precio.
  return prisma.product.create({ data: { ...data, wholesalePrice: data.individualPrice } });
}

export async function updateProduct(id: string, data: ProductInput) {
  await assertSlugAvailable(data.slug, id);
  await assertCategoryExists(data.categoryId);
  const product = await prisma.product.update({ where: { id }, data });
  // Al activar o quitar las tallas, las líneas de carrito que quedaron del
  // otro modo (con talla en un producto sin tallas, o al revés) ya no
  // describen algo comprable: se borran en vez de dejarlas colgadas.
  await prisma.cartItem.deleteMany({
    where: { productId: id, variantId: data.hasVariants ? null : { not: null } },
  });
  return product;
}

export async function deleteProduct(id: string) {
  const images = await prisma.productImage.findMany({ where: { productId: id } });
  await Promise.all(images.map((image) => deleteFromR2(image.key)));
  await prisma.product.delete({ where: { id } });
}
