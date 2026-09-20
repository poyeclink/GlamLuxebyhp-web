"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE_NAME, type Locale } from "@/lib/i18n";

const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export async function setLocaleAction(locale: Locale) {
  const store = await cookies();
  store.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
  });
  // Todo el árbol depende del locale (SiteHeader, páginas, footer) — invalidar
  // solo la ruta actual dejaría el resto de la navegación con contenido viejo
  // en caché hasta la siguiente visita a cada una.
  revalidatePath("/", "layout");
}
