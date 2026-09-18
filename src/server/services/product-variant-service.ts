import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/server/services/inventory-service";

export class ProductVariantError extends Error {}

// Para la alerta de stock bajo del dashboard admin — solo variantes de
// productos activos (una desactivada no necesita reponerse).
export function listLowStockVariants(limit = 10) {
  return prisma.productVariant.findMany({
    where: { stock: { lte: LOW_STOCK_THRESHOLD }, product: { active: true } },
    orderBy: { stock: "asc" },
    take: limit,
    include: { product: { select: { name: true, slug: true } } },
  });
}

type VariantInput = {
  size: string;
  stock: number;
};

async function assertSizeAvailable(productId: string, size: string, excludeId?: string) {
  const existing = await prisma.productVariant.findFirst({ where: { productId, size } });
  if (existing && existing.id !== excludeId) {
    throw new ProductVariantError(`Ya existe la talla "${size}" para este producto.`);
  }
}

export async function createVariant(productId: string, data: VariantInput) {
  await assertSizeAvailable(productId, data.size);
  return prisma.productVariant.create({ data: { productId, ...data } });
}

export async function updateVariant(id: string, data: VariantInput) {
  const existing = await prisma.productVariant.findUniqueOrThrow({ where: { id } });
  await assertSizeAvailable(existing.productId, data.size, id);
  return prisma.productVariant.update({ where: { id }, data });
}

export async function deleteVariant(id: string) {
  await prisma.productVariant.delete({ where: { id } });
}
