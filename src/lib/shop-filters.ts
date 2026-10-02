// Filtros de /tienda: la URL es la fuente de verdad (igual que los listados
// del admin). Puro y sin Prisma, para que también lo importen los Client
// Components del formulario de filtros.

export const SHOP_PAGE_SIZE = 24;

export const SORT_OPTIONS = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre A–Z" },
] as const;

export type ShopSort = (typeof SORT_OPTIONS)[number]["value"];

export type ShopFilters = {
  categoria?: string;
  q?: string;
  min?: number;
  max?: number;
  tallas: string[];
  disponible: boolean;
  orden: ShopSort;
  page: number;
};

type Params = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined) {
  const text = Array.isArray(value) ? value[0] : value;
  return text?.trim() || undefined;
}

function price(value: string | string[] | undefined) {
  const number = Number(single(value));
  return Number.isFinite(number) && number >= 0 && single(value) ? number : undefined;
}

export function parseShopFilters(params: Params): ShopFilters {
  const orden = single(params.orden);
  const tallas = params.talla;
  return {
    categoria: single(params.categoria),
    q: single(params.q)?.slice(0, 80),
    min: price(params.min),
    max: price(params.max),
    tallas: (Array.isArray(tallas) ? tallas : tallas ? [tallas] : []).filter(Boolean).slice(0, 20),
    disponible: single(params.disponible) === "1",
    orden: SORT_OPTIONS.some((option) => option.value === orden)
      ? (orden as ShopSort)
      : "recientes",
    page: Math.min(Math.max(Number(single(params.page)) || 1, 1), 50),
  };
}

// Arma la URL de /tienda con los filtros actuales más los cambios pedidos.
// Cualquier cambio de filtro vuelve a la página 1, salvo que se pida otra.
export function shopHref(filters: ShopFilters, changes: Partial<ShopFilters> = {}) {
  const next = { ...filters, page: 1, ...changes };
  const params = new URLSearchParams();
  if (next.categoria) params.set("categoria", next.categoria);
  if (next.q) params.set("q", next.q);
  if (next.min !== undefined) params.set("min", String(next.min));
  if (next.max !== undefined) params.set("max", String(next.max));
  for (const talla of next.tallas) params.append("talla", talla);
  if (next.disponible) params.set("disponible", "1");
  if (next.orden !== "recientes") params.set("orden", next.orden);
  if (next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return query ? `/tienda?${query}` : "/tienda";
}

export function countActiveFilters(filters: ShopFilters) {
  return (
    (filters.min !== undefined ? 1 : 0) +
    (filters.max !== undefined ? 1 : 0) +
    filters.tallas.length +
    (filters.disponible ? 1 : 0)
  );
}
