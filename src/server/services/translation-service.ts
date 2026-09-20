import { createHash } from "crypto";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { translateWithWorkersAi } from "@/lib/cloudflare-ai";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function hashSourceText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

// Traduce y cachea en Postgres (tabla Translation) — nunca archivos de
// idioma: cualquier texto, sea copy estático o contenido que un admin agregue
// después (nombre/descripción de producto, categoría), pasa por el mismo
// camino. Si Cloudflare Workers AI falla (token sin configurar, red, etc.) se
// devuelve el texto original en vez de romper la página que lo está pidiendo.
export async function translate(text: string, targetLocale: "en"): Promise<string> {
  if (!text.trim()) return text;
  const sourceHash = hashSourceText(text);

  const cached = await prisma.translation.findUnique({
    where: { sourceHash_targetLocale: { sourceHash, targetLocale } },
  });
  if (cached) return cached.translatedText;

  let translatedText: string;
  try {
    translatedText = await translateWithWorkersAi(text, targetLocale);
  } catch (error) {
    console.error("translate: fallback al texto original.", error);
    return text;
  }

  try {
    await prisma.translation.create({
      data: { sourceHash, targetLocale, sourceText: text, translatedText },
    });
  } catch (error) {
    // Dos requests concurrentes tradujeron el mismo texto por primera vez a
    // la vez — la que perdió la carrera reusa la fila que la otra ya creó,
    // mismo patrón que addToCart en cart-service.ts.
    if (!isUniqueConstraintError(error)) throw error;
  }

  return translatedText;
}
