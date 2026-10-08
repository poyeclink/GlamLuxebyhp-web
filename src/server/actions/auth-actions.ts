"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import {
  AuthError,
  authenticateAdmin,
  authenticateCustomer,
  getUserByEmail,
  registerCustomer,
  resetPassword,
} from "@/server/services/auth-service";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { getCartSessionToken, clearCartSessionToken } from "@/lib/cart-session";
import { createPasswordResetToken } from "@/lib/password-reset";
import { mergeGuestCartIntoUser } from "@/server/services/cart-service";
import { setUserAvatar } from "@/server/services/user-service";
import {
  notifyAdminNewCustomer,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "@/server/email/notifications";
import { getLocale, t } from "@/lib/i18n";

export type AuthActionState = {
  error?: string;
};

async function mergeGuestCartOnAuth(userId: string) {
  const guestToken = await getCartSessionToken();
  if (!guestToken) return;

  try {
    await mergeGuestCartIntoUser(guestToken, userId);
  } catch {
    // No bloquear un login/registro ya exitoso (la cookie de sesión ya se
    // asignó) por un fallo al fusionar el carrito — en el peor caso el
    // cliente pierde lo que traía como invitado, pero entra a su cuenta.
  }
  await clearCartSessionToken();
}

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
    return { error: await t(parsed.error.issues[0]?.message ?? "Datos inválidos.") };
  }

  try {
    const user = await registerCustomer(parsed.data);
    await setSessionCookie({ userId: user.id, role: user.role, name: user.name });
    await saveSignupAvatar(user.id, formData.get("avatar"));
    await mergeGuestCartOnAuth(user.id);
    const locale = await getLocale();
    after(() => Promise.all([sendWelcomeEmail(user, locale), notifyAdminNewCustomer(user)]));
  } catch (error) {
    if (error instanceof AuthError) return { error: await t(error.message) };
    throw error;
  }

  redirect("/perfil");
}

// La foto es opcional al registrarse: si falla (formato, R2), la cuenta ya
// está creada y se puede subir después desde /perfil.
async function saveSignupAvatar(userId: string, file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return;
  try {
    await setUserAvatar(userId, file);
  } catch (error) {
    console.error(`No se pudo guardar la foto de perfil de ${userId}`, error);
  }
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: await t(parsed.error.issues[0]?.message ?? "Datos inválidos.") };
  }

  try {
    const user = await authenticateCustomer(parsed.data);
    await setSessionCookie({ userId: user.id, role: user.role, name: user.name });
    await mergeGuestCartOnAuth(user.id);
  } catch (error) {
    if (error instanceof AuthError) return { error: await t(error.message) };
    throw error;
  }

  redirect("/perfil");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function adminLoginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const user = await authenticateAdmin(parsed.data);
    await setSessionCookie({ userId: user.id, role: user.role, name: user.name });
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    throw error;
  }

  redirect("/admin");
}

export async function adminLogoutAction() {
  await clearSessionCookie();
  redirect("/acceso-admin");
}

export type PasswordResetRequestState = { error?: string; sent?: boolean };

// Freno por instancia: evita que alguien agote la cuota diaria de Gmail
// pidiendo enlaces para el mismo correo una y otra vez.
const RESET_REQUEST_COOLDOWN_MS = 60_000;
const lastResetRequestAt = new Map<string, number>();

export async function requestPasswordResetAction(
  _prevState: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  const parsed = z.object({ email: z.email("Correo inválido.") }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: await t(parsed.error.issues[0]?.message ?? "Datos inválidos.") };
  }

  const email = parsed.data.email;
  if (Date.now() - (lastResetRequestAt.get(email) ?? 0) > RESET_REQUEST_COOLDOWN_MS) {
    lastResetRequestAt.set(email, Date.now());
    const locale = await getLocale();
    // La búsqueda va después de responder: la respuesta es la misma y tarda
    // lo mismo exista o no la cuenta, así no se filtra qué correos existen.
    after(async () => {
      const user = await getUserByEmail(email);
      if (!user) return;
      const token = await createPasswordResetToken(user);
      await sendPasswordResetEmail(user, token, user.role === "administrador" ? "es" : locale);
    });
  }

  return { sent: true };
}

const newPasswordSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
  });

export async function resetPasswordAction(
  token: string,
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = newPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: await t(parsed.error.issues[0]?.message ?? "Datos inválidos.") };
  }

  let changed;
  try {
    changed = await resetPassword(token, parsed.data.password);
  } catch (error) {
    if (error instanceof AuthError) return { error: await t(error.message) };
    throw error;
  }

  const user = changed;
  const isAdmin = user.role === "administrador";
  const locale = isAdmin ? "es" : await getLocale();
  after(() => sendPasswordChangedEmail(user, locale));

  // Abrir el enlace del correo ya prueba que es su cuenta: entra directo.
  await setSessionCookie({ userId: user.id, role: user.role, name: user.name });
  if (!isAdmin) await mergeGuestCartOnAuth(user.id);
  redirect(isAdmin ? "/admin" : "/perfil");
}
