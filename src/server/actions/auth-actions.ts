"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { AuthError, authenticateCustomer, registerCustomer } from "@/server/services/auth-service";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";

export type AuthActionState = {
  error?: string;
};

const registerSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto."),
  email: z.email("Correo inválido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

const loginSchema = z.object({
  email: z.email("Correo inválido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const user = await registerCustomer(parsed.data);
    await setSessionCookie({ userId: user.id, role: user.role, name: user.name });
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    throw error;
  }

  redirect("/perfil");
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const user = await authenticateCustomer(parsed.data);
    await setSessionCookie({ userId: user.id, role: user.role, name: user.name });
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    throw error;
  }

  redirect("/perfil");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
