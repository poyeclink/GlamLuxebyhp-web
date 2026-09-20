import { cache } from "react";
import { cookies } from "next/headers";
import { translate } from "@/server/services/translation-service";

export const LOCALE_COOKIE_NAME = "glamluxe_locale";
export type Locale = "es" | "en";
// El sitio se autora en español — "es" nunca pasa por traducción, solo "en".
export const DEFAULT_LOCALE: Locale = "es";

export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  return store.get(LOCALE_COOKIE_NAME)?.value === "en" ? "en" : DEFAULT_LOCALE;
});

// cache(): memoiza por texto dentro de la misma request — una página que
// repite "Ver detalles" en cada fila de una tabla no dispara una traducción
// (ni una consulta a Postgres) por repetición.
export const t = cache(async (text: string): Promise<string> => {
  const locale = await getLocale();
  if (locale === DEFAULT_LOCALE) return text;
  return translate(text, locale);
});
