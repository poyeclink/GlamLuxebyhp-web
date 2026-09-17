import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/server/services/product-image-service";

export class ProductError extends Error {}

export function listProducts() {
  return prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { category: true },
  });
}

export function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
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
