"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";

function ToggleButton({ soldOut, size }: { soldOut: boolean; size?: string }) {
  const t = useAdminT();
  const { pending } = useFormStatus();
  const status = soldOut ? t("Agotado") : t("Disponible");

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={
        size
          ? t("Talla {size}: {status}. Tocar para cambiar.", { size, status })
          : t("{status}. Tocar para cambiar.", { status })
      }
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 sm:min-h-9",
        soldOut
          ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
          : "border-border bg-background text-foreground hover:border-foreground/40",
      )}
    >
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", soldOut ? "bg-destructive" : "bg-accent")}
        aria-hidden="true"
      />
      {size && <span className="font-semibold">{size}</span>}
      <span className={cn(size && "text-xs font-normal")}>{status}</span>
    </button>
  );
}

// Un toque cambia Disponible ↔ Agotado; `action` ya viene con el valor nuevo.
export function AvailabilityToggle({
  soldOut,
  size,
  action,
}: {
  soldOut: boolean;
  size?: string;
  action: () => Promise<void>;
}) {
  return (
    <form action={action}>
      <ToggleButton soldOut={soldOut} size={size} />
    </form>
  );
}
