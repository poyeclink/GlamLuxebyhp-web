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

export async function authenticateCustomer(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AuthError("Correo o contraseña incorrectos.");

  const validPassword = await verifyPassword(input.password, user.passwordHash);
  if (!validPassword) throw new AuthError("Correo o contraseña incorrectos.");

  if (user.role !== "cliente") throw new AuthError("Correo o contraseña incorrectos.");

  return user;
}
