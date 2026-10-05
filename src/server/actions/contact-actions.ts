"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { t } from "@/lib/i18n";
import { notifyAdminContactMessage } from "@/server/email/notifications";

export type ContactActionState = { error?: string; sent?: boolean };

// Freno por instancia: un bot no debe poder agotar la cuota diaria de Gmail
// (~500), que comparten los correos de pedidos y de recuperar contraseña.
const MAX_PER_WINDOW = 3;
const WINDOW_MS = 10 * 60_000;
const recentByIp = new Map<string, number[]>();

function allowSubmission(ip: string) {
  const now = Date.now();
  const recent = (recentByIp.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return false;
  recentByIp.set(ip, [...recent, now]);
  return true;
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(80),
  email: z.email("Correo inválido."),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => (v ? v : null)),
  topic: z.string().trim().min(1).max(80),
  message: z.string().trim().min(10, "Cuéntanos un poco más en tu mensaje.").max(600),
});

export async function submitContactAction(
  _prevState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  // Campo trampa invisible: un humano no lo llena, un bot de spam sí. Se
  // responde como si se hubiera enviado para no darle pistas.
  if (formData.get("website")) return { sent: true };

  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: await t(parsed.error.issues[0]?.message ?? "Datos inválidos.") };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowSubmission(ip)) {
    return { error: await t("Recibimos varios mensajes seguidos. Espera unos minutos o escríbenos por WhatsApp.") };
  }

  // Se espera el envío (no after()): si falla, la persona tiene que saberlo
  // para escribir por otro canal en vez de creer que llegó.
  const sent = await notifyAdminContactMessage(parsed.data);
  if (!sent) {
    return { error: await t("No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.") };
  }
  return { sent: true };
}
