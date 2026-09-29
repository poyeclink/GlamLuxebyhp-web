import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PriceDual } from "@/components/ui/PriceDual";
import { ImageGallery } from "@/components/shop/ImageGallery";
import { AddToCartForm } from "@/components/shop/AddToCartForm";
import { ProductCard } from "@/components/shop/ProductCard";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import {
  getProductBySlug,
  listRelatedProducts,
  toProductCardItem,
} from "@/server/services/product-service";
import { r2PublicUrl } from "@/lib/r2";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";

// generateMetadata y la página piden el mismo producto en la misma request.
const getProduct = cache(getProductBySlug);

export async function generateMetadata({
  params,
}: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const description = product.description.slice(0, 160);
  const image = product.images.find((img) => img.isPrimary) ?? product.images[0];
  return {
    title: product.name,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: image ? [{ url: r2PublicUrl(image.key), alt: image.alt ?? product.name }] : undefined,
    },
  };
}

export default async function ProductoPage({ params }: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
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

  const inStock = !product.hasVariants || product.variants.some((variant) => variant.stock > 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:py-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: images.map((image) => image.url),
          category: product.category.name,
          brand: { "@type": "Brand", name: SITE_NAME },
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/producto/${product.slug}`,
            priceCurrency: "USD",
            price: Number(product.individualPrice),
            availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
        }}
      />
      <nav aria-label="Ruta" className="text-sm text-muted-foreground">
        <Link href="/tienda" className="hover:text-foreground">
          Tienda
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/tienda?categoria=${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ImageGallery images={images} initialIndex={initialIndex} />

        <div className="flex flex-col gap-4 md:sticky md:top-24 md:self-start">
          <p className="eyebrow text-accent">{product.category.name}</p>
          <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>
          <PriceDual
            wholesalePrice={Number(product.wholesalePrice)}
            individualPrice={Number(product.individualPrice)}
          />
          <p className="whitespace-pre-line text-sm text-muted-foreground">{product.description}</p>

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

      <RelatedProducts itemCount={relatedProducts.length}>
        {relatedProducts.map((product) => (
          <div key={product.slug} className="w-[45%] shrink-0 snap-start sm:w-[30%] lg:w-[22%]">
            <ProductCard product={product} />
          </div>
        ))}
      </RelatedProducts>
    </div>
  );
}
