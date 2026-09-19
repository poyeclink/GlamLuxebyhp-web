import { notFound } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PriceDual } from "@/components/ui/PriceDual";
import { ImageGallery } from "@/components/shop/ImageGallery";
import { AddToCartForm } from "@/components/shop/AddToCartForm";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import {
  getProductBySlug,
  listRelatedProducts,
  toProductCardItem,
} from "@/server/services/product-service";
import { r2PublicUrl } from "@/lib/r2";

export default async function ProductoPage({ params }: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const images = product.images.map((image) => ({
    id: image.id,
    url: r2PublicUrl(image.key),
    alt: image.alt ?? product.name,
  }));
  const initialIndex = Math.max(
    product.images.findIndex((image) => image.isPrimary),
    0,
  );

  const relatedProducts = (await listRelatedProducts(product.categoryId, product.id)).map(
    toProductCardItem,
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16">
      <nav className="text-sm text-muted-foreground">
        <Link href="/tienda" className="hover:text-foreground">
          Tienda
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/tienda?categoria=${product.category.slug}`}
          className="hover:text-foreground"
        >
          {product.category.name}
        </Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ImageGallery images={images} initialIndex={initialIndex} />

        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-foreground">{product.name}</h1>
          <PriceDual
            wholesalePrice={Number(product.wholesalePrice)}
            individualPrice={Number(product.individualPrice)}
          />
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {product.description}
          </p>

          {product.boxed ? (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              Viene en caja
            </div>
          ) : null}

          {product.hasVariants && product.variants.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Tallas disponibles</span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <Badge key={variant.id} variant={variant.stock > 0 ? "secondary" : "outline"}>
                    {variant.size}
                    {variant.stock === 0 ? " (agotado)" : ""}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          <AddToCartForm
            productId={product.id}
            hasVariants={product.hasVariants}
            variants={product.variants}
          />
        </div>
      </div>

      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
