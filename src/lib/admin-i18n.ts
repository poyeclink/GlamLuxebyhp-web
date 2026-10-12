import en from "@/i18n/admin.en.json";
import type { Locale } from "@/lib/i18n";

export type AdminT = (text: string, vars?: Record<string, string | number>) => string;

const EN: Record<string, string> = en;

function missing(text: string) {
  if (process.env.NODE_ENV !== "production") console.warn(`[admin i18n] Falta en admin.en.json: "${text}"`);
  return text;
}

// El admin se escribe en español en el código y las claves de admin.en.json son
// ese mismo texto: un texto que falte en el diccionario se ve en español en vez
// de una clave rota. Sin LLM a propósito (a diferencia de la tienda): el copy
// del panel es fijo y así no depende de Workers AI.
export function adminTranslator(locale: Locale): AdminT {
  return (text, vars) => {
    let out = locale === "en" ? (EN[text] ?? missing(text)) : text;
    if (vars) for (const [key, value] of Object.entries(vars)) out = out.replaceAll(`{${key}}`, String(value));
    return out;
  };
}
