import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

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
