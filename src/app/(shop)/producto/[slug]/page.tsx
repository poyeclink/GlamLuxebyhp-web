import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, Package, ShieldCheck, Sparkles } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
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
import { t, tMany } from "@/lib/i18n";

const TRUST = [
  { icon: ShieldCheck, label: "Pago seguro" },
  { icon: BadgeCheck, label: "Confirmación inmediata" },
  { icon: Sparkles, label: "Calidad revisada" },
];

const PURCHASE_INFO = [
  {
    question: "Envío",
    answer:
      "En compras al detalle el envío depende de la cantidad de artículos y lo ves en tu carrito antes de pagar. En pedidos mayoristas coordinamos el envío contigo.",
  },
  {
    question: "Pago",
    answer:
      "Pagas con tarjeta de crédito o débito en una página de pago segura. Tu pedido se confirma en el momento en que se completa el pago.",
  },
  {
    question: "Cambios y devoluciones",
    answer:
      "Todas las ventas son finales. Si recibes una pieza con daño de fábrica, repórtalo dentro de las primeras 24 horas y lo resolvemos contigo.",
  },
];

// generateMetadata y la página piden el mismo producto en la misma request.
const getProduct = cache(getProductBySlug);

export async function generateMetadata({
  params,
}: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const image = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const [title, fullDescription, alt] = await Promise.all([
    t(product.name),
    t(product.description),
    t(image?.alt ?? product.name),
  ]);
  const description = fullDescription.slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      title,
      description,
      // Definir openGraph en la página reemplaza la imagen de marca del layout:
      // sin foto propia se vuelve a poner, o el link compartido sale sin preview.
      images: image ? [{ url: r2PublicUrl(image.key), alt }] : ["/opengraph-image"],
    },
  };
}

export default async function ProductoPage({ params }: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [
    copy,
    cartCopy,
    relatedCopy,
    name,
    description,
    categoryName,
    parentName,
    trust,
    purchaseInfo,
    images,
  ] = await Promise.all([
    tMany({
      breadcrumb: "Ruta",
      shop: "Tienda",
      boxed: "Viene en caja",
      description: "Descripción",
    }),
    tMany({
      size: "Talla",
      quantity: "Cantidad",
      soldOut: "Agotado",
      add: "Agregar al carrito",
      added: "Agregado a tu carrito",
      viewCart: "Ver carrito",
      pending: "Agregando…",
      decrease: "Disminuir cantidad",
      increase: "Aumentar cantidad",
    }),
    tMany({
      title: "Productos que te podrían interesar",
      previous: "Ver anteriores",
      next: "Ver siguientes",
    }),
    t(product.name),
    t(product.description),
    t(product.category.name),
    product.category.parent ? t(product.category.parent.name) : undefined,
    Promise.all(TRUST.map(async (item) => ({ ...item, label: await t(item.label) }))),
    Promise.all(
      PURCHASE_INFO.map(async (item) => ({
        question: await t(item.question),
        answer: await t(item.answer),
      })),
    ),
    Promise.all(
      product.images.map(async (image) => ({
        id: image.id,
        url: r2PublicUrl(image.key),
        alt: await t(image.alt ?? product.name),
      })),
    ),
  ]);
  const categoryText = parentName ? `${parentName} › ${categoryName}` : categoryName;
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
          name,
          description,
          sku: product.slug,
          image: images.map((image) => image.url),
          category: categoryText,
          brand: { "@type": "Brand", name: SITE_NAME },
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/producto/${product.slug}`,
            priceCurrency: "USD",
            price: Number(product.individualPrice),
            itemCondition: "https://schema.org/NewCondition",
            availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: SITE_NAME },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { name: copy.shop, path: "/tienda" },
            ...(product.category.parent
              ? [{ name: parentName, path: `/tienda?categoria=${product.category.parent.slug}` }]
              : []),
            { name: categoryName, path: `/tienda?categoria=${product.category.slug}` },
            { name, path: `/producto/${product.slug}` },
          ].map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.name,
            item: `${SITE_URL}${crumb.path}`,
          })),
        }}
      />
      <nav aria-label={copy.breadcrumb} className="text-sm text-muted-foreground [&_a]:-my-3 [&_a]:inline-block [&_a]:py-3">
        <Link href="/tienda" className="hover:text-foreground">
          {copy.shop}
        </Link>
        {product.category.parent && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/tienda?categoria=${product.category.parent.slug}`}
              className="hover:text-foreground"
            >
              {parentName}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <Link href={`/tienda?categoria=${product.category.slug}`} className="hover:text-foreground">
          {categoryName}
        </Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ImageGallery images={images} initialIndex={initialIndex} />

        <div className="flex flex-col gap-5">
          <p className="eyebrow text-accent">{categoryText}</p>
          <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
            {name}
          </h1>
          <PriceDual
            wholesalePrice={Number(product.wholesalePrice)}
            individualPrice={Number(product.individualPrice)}
          />

          {product.boxed ? (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              {copy.boxed}
            </div>
          ) : null}

          <div className="border-t border-border pt-5">
            <AddToCartForm
              productId={product.id}
              hasVariants={product.hasVariants}
              variants={product.variants}
              copy={cartCopy}
            />
          </div>

          <ul className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
            {trust.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-md bg-muted/60 px-2 py-3"
              >
                <Icon className="h-5 w-5 text-accent" />
                {label}
              </li>
            ))}
          </ul>

          <Accordion
            items={[
              ...(product.description ? [{ question: copy.description, answer: description }] : []),
              ...purchaseInfo,
            ]}
          />
        </div>
      </div>

      <RelatedProducts itemCount={relatedProducts.length} copy={relatedCopy}>
        {relatedProducts.map((product) => (
          <div key={product.slug} className="w-[45%] shrink-0 snap-start sm:w-[30%] lg:w-[22%]">
            <ProductCard product={product} />
          </div>
        ))}
      </RelatedProducts>
    </div>
  );
}
