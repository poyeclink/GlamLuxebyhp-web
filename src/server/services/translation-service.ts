import { createHash } from "crypto";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { translateWithWorkersAi } from "@/lib/cloudflare-ai";

type TargetLocale = "en";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function hashSourceText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

// Caché en memoria por instancia: la tabla entera se carga con UNA consulta la
// primera vez que se necesita. Antes era un findUnique por texto, y una
// instancia recién arrancada disparaba decenas de consultas por página contra
// un pool de pocas conexiones (navegaciones de varios segundos o colgadas).
// Las traducciones no cambian, así que no expira.
const memoryCache = new Map<string, string>();
const preloads = new Map<TargetLocale, Promise<void>>();
const inflight = new Map<string, Promise<string>>();

function preload(targetLocale: TargetLocale) {
  let pending = preloads.get(targetLocale);
  if (!pending) {
    pending = prisma.translation
      .findMany({ where: { targetLocale }, select: { sourceHash: true, translatedText: true } })
      .then((rows) => {
        for (const row of rows)
          memoryCache.set(`${targetLocale}:${row.sourceHash}`, row.translatedText);
      })
      .catch((error) => {
        // Sin esto, un fallo transitorio de la base dejaría la precarga rota
        // para siempre en esta instancia.
        preloads.delete(targetLocale);
        throw error;
      });
    preloads.set(targetLocale, pending);
  }
  return pending;
}

// Traduce y cachea en Postgres (tabla Translation) — nunca archivos de
// idioma: cualquier texto, sea copy estático o contenido que un admin agregue
// después (nombre/descripción de producto, categoría), pasa por el mismo
// camino. Si la base o Cloudflare Workers AI fallan se devuelve el texto
// original en vez de romper la página que lo está pidiendo.
export async function translate(text: string, targetLocale: TargetLocale): Promise<string> {
  if (!text.trim()) return text;
  const sourceHash = hashSourceText(text);
  const memoryKey = `${targetLocale}:${sourceHash}`;

  try {
    await preload(targetLocale);
  } catch (error) {
    console.error("translate: no se pudo cargar la caché.", error);
    return text;
  }
  const remembered = memoryCache.get(memoryKey);
  if (remembered !== undefined) return remembered;

  // Varios componentes de la misma página (o requests simultáneos) pueden
  // pedir el mismo texto nuevo a la vez: una sola llamada al LLM para todos.
  let pending = inflight.get(memoryKey);
  if (!pending) {
    pending = translateAndStore(text, sourceHash, targetLocale).finally(() =>
      inflight.delete(memoryKey),
    );
    inflight.set(memoryKey, pending);
  }
  return pending;
}

async function translateAndStore(text: string, sourceHash: string, targetLocale: TargetLocale) {
  let translatedText: string;
  try {
    translatedText = await translateWithWorkersAi(text);
  } catch (error) {
    console.error("translate: fallback al texto original.", error);
    return text;
  }

  try {
    await prisma.translation.create({
      data: { sourceHash, targetLocale, sourceText: text, translatedText },
    });
  } catch (error) {
    // Otra instancia tradujo el mismo texto a la vez — se reusa la fila que
    // ganó (el LLM no siempre da la misma salida: sin esto, cada instancia
    // podía quedarse con una versión distinta en memoria).
    if (!isUniqueConstraintError(error)) {
      console.error("translate: no se pudo guardar la traducción.", error);
      return translatedText;
    }
    const winner = await prisma.translation.findUnique({
      where: { sourceHash_targetLocale: { sourceHash, targetLocale } },
    });
    if (winner) translatedText = winner.translatedText;
  }

  memoryCache.set(`${targetLocale}:${sourceHash}`, translatedText);
  return translatedText;
}
