"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCustomer, setSessionCookie } from "@/lib/session";
import { updateProfile } from "@/server/services/user-service";

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
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const updated = await updateProfile(session.userId, parsed.data);

  // El nombre en la cookie de sesión (JWT) queda desactualizado si no se
  // reemite aquí — getSession() no vuelve a leer la fila de User en cada
  // request, solo verifica el token existente.
  await setSessionCookie({ userId: session.userId, role: session.role, name: updated.name });

  revalidatePath("/perfil");
  return { success: true };
}
