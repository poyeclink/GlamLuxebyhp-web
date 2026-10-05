import { cache } from "react";
import { cookies } from "next/headers";
import { translate } from "@/server/services/translation-service";

export const LOCALE_COOKIE_NAME = "glamluxe_locale";
export type Locale = "es" | "en";
// El sitio se autora en español ("es" nunca pasa por traducción), pero el
// visitante lo ve en inglés salvo que elija español en el selector.
export const SOURCE_LOCALE: Locale = "es";
export const DEFAULT_LOCALE: Locale = "en";

export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  return store.get(LOCALE_COOKIE_NAME)?.value === "es" ? "es" : DEFAULT_LOCALE;
});

// cache(): memoiza por texto dentro de la misma request — una página que
// repite "Ver detalles" en cada fila de una tabla no dispara una traducción
// (ni una consulta a Postgres) por repetición.
export const t = cache(async (text: string): Promise<string> => {
  const locale = await getLocale();
  if (locale === SOURCE_LOCALE) return text;
  return translate(text, locale);
});

// Traduce un diccionario de textos en paralelo — evita el Promise.all
// posicional (y sus índices frágiles) en páginas con mucho copy.
export async function tMany<T extends Record<string, string>>(texts: T): Promise<T> {
  const entries = await Promise.all(
    Object.entries(texts).map(async ([key, text]) => [key, await t(text)] as const),
  );
  return Object.fromEntries(entries) as T;
}
