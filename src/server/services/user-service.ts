import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { r2PublicUrl } from "@/lib/r2";
import {
  assertValidImageFile,
  deleteFromR2,
  uploadToR2,
} from "@/server/services/product-image-service";

export function getCustomerProfile(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, email: true, whatsapp: true, avatarKey: true },
  });
}

type ProfileInput = {
  name: string;
  whatsapp: string | null;
};

export function updateProfile(userId: string, data: ProfileInput) {
  return prisma.user.update({ where: { id: userId }, data });
}

export async function getUserAvatarUrl(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatarKey: true } });
  return user?.avatarKey ? r2PublicUrl(user.avatarKey) : null;
}

const AVATAR_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Key nueva en cada cambio (no se pisa la anterior): la URL cambia y ningún
// navegador ni CDN muestra la foto vieja desde caché.
export async function setUserAvatar(userId: string, file: File) {
  assertValidImageFile(file);
  const key = `avatars/${userId}/${randomUUID()}.${AVATAR_EXTENSIONS[file.type]}`;
  await uploadToR2(key, file);
  const previous = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { avatarKey: true },
  });
  await prisma.user.update({ where: { id: userId }, data: { avatarKey: key } });
  if (previous.avatarKey) await deleteFromR2(previous.avatarKey);
}

export async function removeUserAvatar(userId: string) {
  const previous = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { avatarKey: true },
  });
  if (!previous.avatarKey) return;
  await prisma.user.update({ where: { id: userId }, data: { avatarKey: null } });
  await deleteFromR2(previous.avatarKey);
}
