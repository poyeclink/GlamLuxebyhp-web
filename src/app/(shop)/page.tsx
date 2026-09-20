import Link from "next/link";
import { CategoryCard } from "@/components/shop/CategoryCard";
import { ProductCard } from "@/components/shop/ProductCard";
import { t } from "@/lib/i18n";
import { listFeaturedCategories } from "@/server/services/category-service";
import { listFeaturedProducts, toProductCardItem } from "@/server/services/product-service";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    listFeaturedCategories(),
    listFeaturedProducts(),
  ]);

  const [tagline, featuredCategoriesTitle, viewShopLabel, noCategoriesLabel, featuredProductsTitle, viewAllLabel, noProductsLabel, categoryNames, productItems] =
    await Promise.all([
      t("Moda al por mayor y al detal, con precios especiales desde 6 artículos."),
      t("Categorías destacadas"),
      t("Ver tienda"),
      t("Aún no hay categorías con productos."),
      t("Productos destacados"),
      t("Ver todo"),
      t("Aún no hay productos disponibles."),
      Promise.all(categories.map((category) => t(category.name))),
      Promise.all(
        products.map(async (product) => {
          const item = toProductCardItem(product);
          const [name, categoryName] = await Promise.all([t(item.name), t(item.categoryName)]);
          return { ...item, name, categoryName };
        }),
      ),
    ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold text-foreground">GlamLuxeByHp</h1>
        <p className="max-w-md text-muted-foreground">{tagline}</p>
      </div>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">{featuredCategoriesTitle}</h2>
          <Link href="/tienda" className="text-sm text-muted-foreground hover:text-foreground">
            {viewShopLabel}
          </Link>
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">{noCategoriesLabel}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={{
                  slug: category.slug,
                  name: categoryNames[index],
                  productCount: category._count.products,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">{featuredProductsTitle}</h2>
          <Link href="/tienda" className="text-sm text-muted-foreground hover:text-foreground">
            {viewAllLabel}
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">{noProductsLabel}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {productItems.map((product, index) => (
              <ProductCard key={products[index].id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
