import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { listShopCategories } from "@/server/services/category-service";
import { listShopProducts, toProductCardItem } from "@/server/services/product-service";
import { filterPillClass } from "@/lib/utils";
import { WHOLESALE_ITEM_THRESHOLD } from "@/server/services/cart-service";

export async function generateMetadata({ searchParams }: PageProps<"/tienda">): Promise<Metadata> {
  const { categoria } = await searchParams;
  const category =
    typeof categoria === "string"
      ? (await listShopCategories()).find((item) => item.slug === categoria)
      : undefined;
  return category
    ? {
        title: `${category.name} — Tienda`,
        description: `Compra ${category.name.toLowerCase()} de alta calidad en Glam Luxe by HP, al detalle o con precio mayorista.`,
        alternates: { canonical: `/tienda?categoria=${category.slug}` },
      }
    : {
        title: "Tienda",
        description: `Ropa, bolsos y accesorios de alta calidad. Precio mayorista automático desde ${WHOLESALE_ITEM_THRESHOLD} artículos.`,
        alternates: { canonical: "/tienda" },
      };
}

export default async function TiendaPage({ searchParams }: PageProps<"/tienda">) {
  const { categoria } = await searchParams;
  const categorySlug = typeof categoria === "string" ? categoria : undefined;

  const [categories, products] = await Promise.all([
    listShopCategories(),
    listShopProducts(categorySlug),
  ]);

  const activeCategory = categories.find((category) => category.slug === categorySlug);
  const isFiltering = Boolean(categorySlug);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:py-16">
      <div className="flex flex-col gap-2 border-b border-border pb-8">
        <p className="eyebrow text-accent">{activeCategory ? "Categoría" : "Colección completa"}</p>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">
            {activeCategory?.name ?? "Tienda"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "producto" : "productos"}
          </p>
        </div>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href="/tienda" className={filterPillClass(!isFiltering)}>
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/tienda?categoria=${category.slug}`}
            className={filterPillClass(activeCategory?.id === category.id)}
          >
            {category.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isFiltering && !activeCategory
            ? "No encontramos esa categoría."
            : activeCategory
              ? `Aún no hay productos en "${activeCategory.name}".`
              : "Aún no hay productos disponibles."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={toProductCardItem(product)} />
          ))}
        </div>
      )}
    </div>
  );
}
