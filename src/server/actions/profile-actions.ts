"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { requireCustomer, setSessionCookie } from "@/lib/session";
import {
  removeUserAvatar,
  setUserAvatar,
  updateProfile,
} from "@/server/services/user-service";
import { ProductImageError } from "@/server/services/product-image-service";
import { AuthError, changePassword } from "@/server/services/auth-service";
import { sendPasswordChangedEmail } from "@/server/email/notifications";
import { getLocale, t } from "@/lib/i18n";

export type ProfileActionState = {
  error?: string;
  success?: boolean;
};

const profileSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto."),
  whatsapp: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
});

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireCustomer();

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: await t(parsed.error.issues[0]?.message ?? "Datos inválidos.") };
  }

  const updated = await updateProfile(session.userId, parsed.data);

  // El nombre en la cookie de sesión (JWT) queda desactualizado si no se
  // reemite aquí — getSession() no vuelve a leer la fila de User en cada
  // request, solo verifica el token existente.
  await setSessionCookie({ userId: session.userId, role: session.role, name: updated.name });

  revalidatePath("/perfil");
  return { success: true };
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual."),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
  });

export async function changePasswordAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireCustomer();

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: await t(parsed.error.issues[0]?.message ?? "Datos inválidos.") };
  }

  try {
    const user = await changePassword(
      session.userId,
      parsed.data.currentPassword,
      parsed.data.password,
    );
    const locale = await getLocale();
    after(() => sendPasswordChangedEmail(user, locale));
  } catch (error) {
    if (error instanceof AuthError) return { error: await t(error.message) };
    throw error;
  }

  return { success: true };
}

export async function updateAvatarAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireCustomer();

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: await t("Elige una foto.") };
  }

  try {
    await setUserAvatar(session.userId, file);
  } catch (error) {
    if (error instanceof ProductImageError) return { error: await t(error.message) };
    throw error;
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function removeAvatarAction(): Promise<ProfileActionState> {
  const session = await requireCustomer();
  await removeUserAvatar(session.userId);
  revalidatePath("/", "layout");
  return { success: true };
}
