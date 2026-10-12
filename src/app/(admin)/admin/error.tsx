"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useAdminT();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-20 text-center sm:py-28">
      <span
        className="material-symbols-outlined flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-[28px] text-accent"
        aria-hidden="true"
      >
        error
      </span>
      <p className="eyebrow text-accent">{t("Algo salió mal")}</p>
      <h1 className="font-display text-3xl text-foreground sm:text-4xl">
        {t("No pudimos completar esta acción")}
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t(
          "Puede ser un problema momentáneo de conexión. Si estabas subiendo fotos, intenta con menos a la vez.",
        )}
      </p>
      <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button size="lg" onClick={() => retry()}>
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          {t("Reintentar")}
        </Button>
        <Link href="/admin">
          <Button size="lg" variant="outline" className="w-full">
            {t("Volver al panel")}
          </Button>
        </Link>
      </div>
      {error.digest && (
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          {t("Código: {code}", { code: error.digest })}
        </p>
      )}
    </div>
  );
}
