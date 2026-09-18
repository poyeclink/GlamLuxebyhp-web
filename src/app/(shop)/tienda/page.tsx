import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { listShopCategories } from "@/server/services/category-service";
import { listShopProducts, toProductCardItem } from "@/server/services/product-service";
import { filterPillClass } from "@/lib/utils";

export default async function TiendaPage({
  searchParams,
}: PageProps<"/tienda">) {
  const { categoria } = await searchParams;
  const categorySlug = typeof categoria === "string" ? categoria : undefined;

  const [categories, products] = await Promise.all([
    listShopCategories(),
    listShopProducts(categorySlug),
  ]);

  const activeCategory = categories.find((category) => category.slug === categorySlug);
  const isFiltering = Boolean(categorySlug);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Tienda</h1>

      <div className="flex flex-wrap gap-2">
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={toProductCardItem(product)} />
          ))}
        </div>
      )}
    </div>
  );
}
