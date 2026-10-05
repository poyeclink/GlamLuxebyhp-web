import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { ArrowDown, Search, X } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopFilterForm } from "@/components/shop/ShopFilterForm";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { Spotlight } from "@/components/motion/Spotlight";
import { Marquee } from "@/components/motion/Marquee";
import { Sello } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { listShopCategories } from "@/server/services/category-service";
import {
  getShopFilterOptions,
  searchShopProducts,
  toProductCardItem,
} from "@/server/services/product-service";
import { cn, filterPillClass } from "@/lib/utils";
import {
  SORT_OPTIONS,
  countActiveFilters,
  parseShopFilters,
  shopHref,
  type ShopSort,
} from "@/lib/shop-filters";
import { t, tMany } from "@/lib/i18n";

type ShopCategory = Awaited<ReturnType<typeof listShopCategories>>[number];

async function listTranslatedCategories() {
  const categories = await listShopCategories();
  return Promise.all(
    categories.map(async (category) => ({
      ...category,
      name: await t(category.name),
      children: await Promise.all(
        category.children.map(async (child) => ({ ...child, name: await t(child.name) })),
      ),
    })),
  );
}

// El slug puede ser de una categoría principal o de una subcategoría; en ambos
// casos se devuelve la principal, para mostrar la fila de subcategorías.
function findCategory(categories: ShopCategory[], slug?: string) {
  for (const root of categories) {
    if (root.slug === slug) return { root, active: root, sub: undefined };
    const sub = root.children.find((child) => child.slug === slug);
    if (sub) return { root, active: sub, sub };
  }
  return undefined;
}

export async function generateMetadata({ searchParams }: PageProps<"/tienda">): Promise<Metadata> {
  const { categoria } = await searchParams;
  const match =
    typeof categoria === "string"
      ? findCategory(await listTranslatedCategories(), categoria)
      : undefined;
  const category = match && {
    slug: match.active.slug,
    name: match.sub ? `${match.root.name} · ${match.sub.name}` : match.root.name,
  };
  const copy = await tMany({
    shop: "Tienda",
    categoryDescription:
      "Compra {name} de alta calidad en Glam Luxe by HJ, al detalle o con precio mayorista.",
    description: "Ropa, bolsos y accesorios de alta calidad, al detalle o por mayor.",
  });
  return category
    ? {
        title: `${category.name} — ${copy.shop}`,
        description: copy.categoryDescription.replace("{name}", category.name.toLowerCase()),
        alternates: { canonical: `/tienda?categoria=${category.slug}` },
      }
    : {
        title: copy.shop,
        description: copy.description,
        alternates: { canonical: "/tienda" },
      };
}

const pillRowClass =
  "-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export default async function TiendaPage({ searchParams }: PageProps<"/tienda">) {
  const filters = parseShopFilters(await searchParams);

  const [categories, { items, total }, options, copy, filterCopy, sortLabels] = await Promise.all([
    listTranslatedCategories(),
    searchShopProducts(filters),
    getShopFilterOptions(filters),
    tMany({
      breadcrumb: "Ruta",
      home: "Inicio",
      shop: "Tienda",
      resultsFor: "Resultados para",
      discover: "Descubre",
      collection: "la colección",
      searchIn: "Buscar en {name}...",
      searchPlaceholder: "Buscar bolsos, zapatos, lentes...",
      searchLabel: "Buscar productos",
      search: "Buscar",
      piece: "pieza",
      pieces: "piezas",
      explore: "Explorar",
      all: "Todas",
      allIn: "Todo en {name}",
      products: "Productos",
      noResults: "Sin resultados",
      showing: "Mostrando {count} de {total}",
      searchChip: "Búsqueda: {q}",
      remove: "Quitar",
      clearAll: "Limpiar todo",
      categoryNotFound: "No encontramos esa categoría",
      noMatches: "No hay piezas con estos filtros",
      emptyHint: "Prueba con otra búsqueda, quita algún filtro o explora la colección completa.",
      viewAll: "Ver toda la tienda",
      seen: "Has visto {count} de {total} piezas",
      more: "Ver más piezas",
    }),
    tMany({
      sortBy: "Ordenar por",
      price: "Precio individual",
      from: "Desde",
      to: "Hasta",
      size: "Talla",
      availability: "Disponibilidad",
      inStock: "Solo con stock",
      apply: "Aplicar filtros",
      clear: "Limpiar",
      filters: "Filtros",
      sort: "Ordenar",
      modalTitle: "Filtrar y ordenar",
      close: "Cerrar",
    }),
    tMany(
      Object.fromEntries(SORT_OPTIONS.map((option) => [option.value, option.label])) as Record<
        ShopSort,
        string
      >,
    ),
  ]);
  const shopCopy = { ...filterCopy, sortLabels };

  const match = findCategory(categories, filters.categoria);
  const products = items.map(toProductCardItem);
  const hasMore = products.length < total;

  const titleA = filters.q ? copy.resultsFor : match?.sub ? match.root.name : copy.discover;
  const titleB = filters.q ? `“${filters.q}”` : (match?.active.name ?? copy.collection);

  const chips = [
    ...(filters.q
      ? [
          {
            label: copy.searchChip.replace("{q}", filters.q),
            href: shopHref(filters, { q: undefined }),
          },
        ]
      : []),
    ...(filters.min !== undefined
      ? [
          {
            label: `${filterCopy.from} $${filters.min}`,
            href: shopHref(filters, { min: undefined }),
          },
        ]
      : []),
    ...(filters.max !== undefined
      ? [{ label: `${filterCopy.to} $${filters.max}`, href: shopHref(filters, { max: undefined }) }]
      : []),
    ...filters.tallas.map((talla) => ({
      label: `${filterCopy.size} ${talla}`,
      href: shopHref(filters, { tallas: filters.tallas.filter((item) => item !== talla) }),
    })),
    ...(filters.disponible
      ? [{ label: filterCopy.inStock, href: shopHref(filters, { disponible: false }) }]
      : []),
  ];
  const clearAllHref = shopHref(filters, {
    q: undefined,
    min: undefined,
    max: undefined,
    tallas: [],
    disponible: false,
  });

  return (
    <>
      <section className="bg-inverse text-inverse-foreground [--logo-accent:var(--inverse-accent)]">
        <Spotlight className="bg-inverse">
          <Sello
            title=""
            className="pointer-events-none absolute -right-28 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 animate-spin-slow text-inverse-foreground opacity-[0.06] motion-reduce:animate-none"
          />
          <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-20">
            <nav
              aria-label={copy.breadcrumb}
              className="eyebrow flex items-center gap-2 text-[0.625rem] text-inverse-muted [&_a]:-my-3 [&_a]:inline-block [&_a]:py-3"
            >
              <Link href="/" className="hover:text-inverse-foreground">
                {copy.home}
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/tienda" className="hover:text-inverse-foreground">
                {copy.shop}
              </Link>
              {match?.sub && (
                <>
                  <span aria-hidden="true">/</span>
                  <Link
                    href={`/tienda?categoria=${match.root.slug}`}
                    className="hover:text-inverse-foreground"
                  >
                    {match.root.name}
                  </Link>
                </>
              )}
            </nav>

            <h1 className="max-w-4xl font-display text-5xl leading-[1.04] sm:text-6xl lg:text-7xl">
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="block animate-rise [animation-delay:60ms]">{titleA}</span>
              </span>
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="block animate-rise break-words italic text-inverse-accent [animation-delay:180ms]">
                  {titleB}
                </span>
              </span>
            </h1>

            <Form
              action="/tienda"
              className="flex w-full max-w-2xl animate-fade-up items-center gap-2 rounded-full border border-inverse-border bg-inverse-foreground/5 p-1.5 pl-5 transition-colors [animation-delay:320ms] focus-within:border-inverse-accent"
            >
              {filters.categoria && (
                <input type="hidden" name="categoria" value={filters.categoria} />
              )}
              <Search className="h-5 w-5 shrink-0 text-inverse-muted" aria-hidden="true" />
              <input
                type="search"
                name="q"
                defaultValue={filters.q}
                placeholder={
                  match
                    ? copy.searchIn.replace("{name}", match.active.name)
                    : copy.searchPlaceholder
                }
                aria-label={copy.searchLabel}
                className="h-11 min-w-0 flex-1 bg-transparent text-base text-inverse-foreground outline-none placeholder:text-inverse-muted"
              />
              <Button type="submit" variant="inverse" className="h-11 rounded-full px-6">
                {copy.search}
              </Button>
            </Form>

            <div className="flex animate-fade-up flex-wrap items-center gap-x-8 gap-y-3 text-sm text-inverse-muted [animation-delay:420ms]">
              <span>
                <strong className="text-2xl font-semibold tabular-nums text-inverse-foreground">
                  {total}
                </strong>{" "}
                {total === 1 ? copy.piece : copy.pieces}
              </span>
              <a
                href="#productos"
                className="group ml-auto hidden items-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-inverse-foreground sm:flex"
              >
                {copy.explore}
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-inverse-border transition-colors group-hover:border-inverse-accent group-hover:text-inverse-accent">
                  <ArrowDown className="h-4 w-4 animate-bounce motion-reduce:animate-none" />
                </span>
              </a>
            </div>
          </div>
        </Spotlight>
      </section>

      {categories.length > 1 && (
        <Marquee
          className="border-b border-border bg-accent-soft py-5 text-foreground"
          items={categories.map((category) => category.name)}
        />
      )}

      <div
        id="productos"
        className="mx-auto flex max-w-7xl scroll-mt-24 flex-col gap-8 px-4 py-10 sm:px-6 lg:scroll-mt-28 lg:py-14"
      >
        <div className="flex flex-col gap-3">
          <div className={pillRowClass}>
            <Link
              href={shopHref(filters, { categoria: undefined, tallas: [] })}
              scroll={false}
              className={filterPillClass(!filters.categoria)}
            >
              {copy.all}
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={shopHref(filters, { categoria: category.slug, tallas: [] })}
                scroll={false}
                className={filterPillClass(match?.root.id === category.id)}
              >
                {category.name}
              </Link>
            ))}
          </div>

          {match && match.root.children.length > 0 && (
            <div className={pillRowClass}>
              <Link
                href={shopHref(filters, { categoria: match.root.slug })}
                scroll={false}
                className={cn(filterPillClass(!match.sub), "px-3 py-1 text-xs")}
              >
                {copy.allIn.replace("{name}", match.root.name)}
              </Link>
              {match.root.children.map((child) => (
                <Link
                  key={child.id}
                  href={shopHref(filters, { categoria: child.slug })}
                  scroll={false}
                  className={cn(filterPillClass(match.sub?.id === child.id), "px-3 py-1 text-xs")}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
            <ShopFilterForm
              key={shopHref(filters)}
              filters={filters}
              options={options}
              idPrefix="d"
              autoSubmit
              copy={shopCopy}
            />
          </aside>

          <section aria-label={copy.products} className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">
                {total === 0
                  ? copy.noResults
                  : copy.showing.split(/(\{count\}|\{total\})/).map((part, index) =>
                      part === "{count}" || part === "{total}" ? (
                        <span key={index} className="font-medium text-foreground">
                          {part === "{count}" ? products.length : total}
                        </span>
                      ) : (
                        part
                      ),
                    )}
              </p>
              <div className="flex items-center gap-2">
                <ShopToolbar
                  filters={filters}
                  options={options}
                  activeCount={countActiveFilters(filters)}
                  copy={shopCopy}
                />
              </div>
            </div>

            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <Link
                    key={chip.href}
                    href={chip.href}
                    scroll={false}
                    className="group flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
                  >
                    {chip.label}
                    <X
                      className="h-3 w-3 opacity-60 group-hover:opacity-100"
                      aria-label={copy.remove}
                    />
                  </Link>
                ))}
                <Link
                  href={clearAllHref}
                  scroll={false}
                  className="px-2 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {copy.clearAll}
                </Link>
              </div>
            )}

            {products.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
                <Search className="h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
                <p className="font-display text-2xl text-foreground">
                  {filters.categoria && !match ? copy.categoryNotFound : copy.noMatches}
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">{copy.emptyHint}</p>
                <Link href="/tienda" scroll={false}>
                  <Button variant="outline">{copy.viewAll}</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            )}

            {hasMore && (
              <div className="flex flex-col items-center gap-4 pt-6">
                <div className="h-0.5 w-48 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(products.length / total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {copy.seen
                    .replace("{count}", String(products.length))
                    .replace("{total}", String(total))}
                </p>
                <Link href={shopHref(filters, { page: filters.page + 1 })} scroll={false}>
                  <Button variant="outline" size="lg">
                    {copy.more}
                  </Button>
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
