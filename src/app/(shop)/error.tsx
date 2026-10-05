"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Única excepción a "todo pasa por t()": esta pantalla aparece justo cuando el
// servidor falló, así que no puede depender de él para traducirse.
const COPY = {
  en: {
    eyebrow: "Something went wrong",
    title: "We couldn't load this page",
    text: "It may be a temporary connection issue. Please try again in a moment.",
    retry: "Try again",
    home: "Back to home",
  },
  es: {
    eyebrow: "Algo salió mal",
    title: "No pudimos cargar esta página",
    text: "Puede ser un problema momentáneo de conexión. Inténtalo de nuevo en unos segundos.",
    retry: "Reintentar",
    home: "Volver al inicio",
  },
};

export default function ShopError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const lang = useSyncExternalStore(
    () => () => {},
    () => document.documentElement.lang,
    () => "en",
  );
  const copy = lang === "es" ? COPY.es : COPY.en;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-24 text-center sm:py-32">
      <p className="eyebrow text-accent">{copy.eyebrow}</p>
      <h1 className="font-display text-4xl text-foreground sm:text-5xl">{copy.title}</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">{copy.text}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={() => retry()}>
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          {copy.retry}
        </Button>
        <Link href="/">
          <Button size="lg" variant="outline">
            {copy.home}
          </Button>
        </Link>
      </div>
    </div>
  );
}
