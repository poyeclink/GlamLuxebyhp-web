import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

export function formatDate(date: Date) {
  return dateFormatter.format(date);
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

// Tamaño de página compartido por los listados del admin (pedidos, productos,
// categorías, inventario) — un solo lugar si se ajusta más adelante.
export const ADMIN_PAGE_SIZE = 20;

// Pastilla de filtro (tienda, admin/pedidos): un solo lugar para que un ajuste
// visual futuro no diverja entre las dos listas que la usan.
export function filterPillClass(active: boolean) {
  return cn(
    "rounded-full border border-border px-4 py-1.5 text-sm font-medium",
    active
      ? "border-foreground bg-foreground text-background"
      : "text-muted-foreground hover:text-foreground",
  );
}
