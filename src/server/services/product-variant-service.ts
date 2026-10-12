import { prisma } from "@/lib/prisma";

export class ProductVariantError extends Error {
  constructor(
    message: string,
    readonly vars?: Record<string, string>,
  ) {
    super(message);
  }
}

type VariantInput = {
  size: string;
};

async function assertSizeAvailable(productId: string, size: string, excludeId?: string) {
  // Sin distinguir mayúsculas: "s" y "S" son la misma talla para la clienta.
  const existing = await prisma.productVariant.findFirst({
    where: { productId, size: { equals: size, mode: "insensitive" } },
  });
  if (existing && existing.id !== excludeId) {
    throw new ProductVariantError('Ya existe la talla "{size}" para este producto.', { size });
  }
}

export async function createVariant(productId: string, data: VariantInput) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product?.hasVariants) {
    throw new ProductVariantError("Este producto no maneja tallas.");
  }
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
