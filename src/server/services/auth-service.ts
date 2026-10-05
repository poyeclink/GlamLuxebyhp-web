import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { matchesFingerprint, readPasswordResetToken } from "@/lib/password-reset";
import { isUuid } from "@/lib/utils";

export class AuthError extends Error {}

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export async function registerCustomer(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AuthError("Ya existe una cuenta con ese correo.");

  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: "cliente",
    },
  });
}

async function authenticateByRole(input: LoginInput, role: "cliente" | "administrador") {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AuthError("Correo o contraseña incorrectos.");

  const validPassword = await verifyPassword(input.password, user.passwordHash);
  if (!validPassword) throw new AuthError("Correo o contraseña incorrectos.");

  if (user.role !== role) throw new AuthError("Correo o contraseña incorrectos.");

  return user;
}

export function authenticateCustomer(input: LoginInput) {
  return authenticateByRole(input, "cliente");
}

export function authenticateAdmin(input: LoginInput) {
  return authenticateByRole(input, "administrador");
}

// Sin distinguir mayúsculas: la respuesta de "recuperar" es la misma exista o
// no la cuenta, así que un "Ana@" vs "ana@" fallaría en silencio.
export function getUserByEmail(email: string) {
  return prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
}

const INVALID_RESET_LINK = "El enlace no es válido o ya venció. Solicita uno nuevo.";

export async function getUserForResetToken(token: string) {
  const data = await readPasswordResetToken(token);
  if (!data || !isUuid(data.userId)) return null;
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user || !matchesFingerprint(user.passwordHash, data.fp)) return null;
  return user;
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await getUserForResetToken(token);
  if (!user) throw new AuthError(INVALID_RESET_LINK);

  // Guardado por el hash viejo: dos envíos del mismo enlace a la vez no
  // pueden usarlo dos veces.
  const updated = await prisma.user.updateMany({
    where: { id: user.id, passwordHash: user.passwordHash },
    data: { passwordHash: await hashPassword(newPassword) },
  });
  if (updated.count === 0) throw new AuthError(INVALID_RESET_LINK);
  return user;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new AuthError("La contraseña actual no es correcta.");
  }
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword) },
  });
  return user;
}
