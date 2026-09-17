import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/server/services/product-image-service";
import { r2PublicUrl } from "@/lib/r2";
import type { ProductCardItem } from "@/components/shop/ProductCard";

export class ProductError extends Error {}

// Sizes are a free-text column (no enum), so Prisma's `orderBy: { size: "asc" }`
// sorts lexicographically ("L" < "M" < "S", "10" < "2") — wrong for both letter
// and numeric sizes. Standard letter sizes get a known order; anything else
// falls back to numeric, then alphabetical.
const LETTER_SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function compareSizes(a: string, b: string) {
  const letterA = LETTER_SIZE_ORDER.indexOf(a.toUpperCase());
  const letterB = LETTER_SIZE_ORDER.indexOf(b.toUpperCase());
  if (letterA !== -1 && letterB !== -1) return letterA - letterB;

  const numA = Number(a);
  const numB = Number(b);
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;

  return a.localeCompare(b);
}

function sortVariantsBySize<T extends { size: string }>(variants: T[]) {
  return [...variants].sort((a, b) => compareSizes(a.size, b.size));
}

export function listProducts() {
  return prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { category: true },
  });
}

export function listFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
    include: {
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
  });
}

export function listShopProducts(categorySlug?: string) {
  return prisma.product.findMany({
    where: {
      active: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
  });
}

type ProductForCard = {
  slug: string;
  name: string;
  wholesalePrice: unknown;
  individualPrice: unknown;
  category: { name: string };
  images: { key: string }[];
};

export function toProductCardItem(product: ProductForCard): ProductCardItem {
  return {
    slug: product.slug,
    name: product.name,
    categoryName: product.category.name,
    wholesalePrice: Number(product.wholesalePrice),
    individualPrice: Number(product.individualPrice),
    imageUrl: product.images[0] ? r2PublicUrl(product.images[0].key) : null,
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { size: "asc" } },
      category: true,
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
      category: true,
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
  wholesalePrice: number;
  individualPrice: number;
  boxed: boolean;
  hasVariants: boolean;
  active: boolean;
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
  return prisma.product.create({ data });
}

export async function updateProduct(id: string, data: ProductInput) {
  await assertSlugAvailable(data.slug, id);
  await assertCategoryExists(data.categoryId);
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string) {
  const images = await prisma.productImage.findMany({ where: { productId: id } });
  await Promise.all(images.map((image) => deleteFromR2(image.key)));
  await prisma.product.delete({ where: { id } });
}
