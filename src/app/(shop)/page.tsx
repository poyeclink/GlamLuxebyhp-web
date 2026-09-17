import Link from "next/link";
import { CategoryCard } from "@/components/shop/CategoryCard";
import { ProductCard } from "@/components/shop/ProductCard";
import { listFeaturedCategories } from "@/server/services/category-service";
import { listFeaturedProducts } from "@/server/services/product-service";
import { r2PublicUrl } from "@/lib/r2";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    listFeaturedCategories(),
    listFeaturedProducts(),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold text-foreground">GlamLuxeByHp</h1>
        <p className="max-w-md text-muted-foreground">
          Moda al por mayor y al detal, con precios especiales desde 6 artículos.
        </p>
      </div>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Categorías destacadas</h2>
          <Link href="/tienda" className="text-sm text-muted-foreground hover:text-foreground">
            Ver tienda
          </Link>
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay categorías con productos.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={{
                  slug: category.slug,
                  name: category.name,
                  productCount: category._count.products,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Productos destacados</h2>
          <Link href="/tienda" className="text-sm text-muted-foreground hover:text-foreground">
            Ver todo
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay productos disponibles.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  slug: product.slug,
                  name: product.name,
                  categoryName: product.category.name,
                  wholesalePrice: Number(product.wholesalePrice),
                  individualPrice: Number(product.individualPrice),
                  imageUrl: product.images[0] ? r2PublicUrl(product.images[0].key) : null,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
