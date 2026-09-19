import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export class ProductImageError extends Error {}

// Exportado: createProductAction (product-actions.ts) pre-valida las
// imágenes elegidas en el formulario de creación antes de crear el producto
// — así un formato/tamaño inválido no crea un producto a medias.
export function assertValidImageFile(file: File) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new ProductImageError("Formato no permitido. Usa JPEG, PNG o WEBP.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ProductImageError("La imagen no puede pesar más de 5MB.");
  }
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
}

function buildKey(productId: string, filename: string) {
  return `products/${productId}/${randomUUID()}-${sanitizeFilename(filename)}`;
}

async function uploadToR2(key: string, file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  );
}

export async function deleteFromR2(key: string) {
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
  } catch (error) {
    console.error(`No se pudo borrar el objeto de R2 (${key}):`, error);
  }
}

export async function addProductImage(productId: string, file: File) {
  assertValidImageFile(file);

  const key = buildKey(productId, file.name);
  await uploadToR2(key, file);

  const existingCount = await prisma.productImage.count({ where: { productId } });

  return prisma.productImage.create({
    data: {
      productId,
      key,
      position: existingCount,
      isPrimary: existingCount === 0,
    },
  });
}

export async function replaceProductImage(imageId: string, file: File) {
  assertValidImageFile(file);

  const existing = await prisma.productImage.findUniqueOrThrow({ where: { id: imageId } });
  const newKey = buildKey(existing.productId, file.name);
  await uploadToR2(newKey, file);

  const updated = await prisma.productImage.update({
    where: { id: imageId },
    data: { key: newKey },
  });

  await deleteFromR2(existing.key);

  return updated;
}

export async function deleteProductImage(imageId: string) {
  const image = await prisma.productImage.delete({ where: { id: imageId } });
  await deleteFromR2(image.key);

  if (image.isPrimary) {
    const nextImage = await prisma.productImage.findFirst({
      where: { productId: image.productId },
      orderBy: { position: "asc" },
    });
    if (nextImage) {
      await prisma.productImage.update({ where: { id: nextImage.id }, data: { isPrimary: true } });
    }
  }

  return image;
}

export async function setPrimaryProductImage(imageId: string) {
  const image = await prisma.productImage.findUniqueOrThrow({ where: { id: imageId } });

  await prisma.$transaction([
    prisma.productImage.updateMany({
      where: { productId: image.productId },
      data: { isPrimary: false },
    }),
    prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);
}
