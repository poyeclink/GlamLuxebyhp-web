import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarClock, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { STOCK_IMAGES } from "@/lib/stock-images";
import { filterPillClass } from "@/lib/utils";
import { Faq } from "@/components/marketing/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { t, tMany } from "@/lib/i18n";
import { CONTACT, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { WHOLESALE_ITEM_THRESHOLD } from "@/server/services/cart-service";
import { listFeaturedCategories, listShopCategories } from "@/server/services/category-service";
import { listFeaturedProducts, toProductCardItem } from "@/server/services/product-service";

type CardProduct = Awaited<ReturnType<typeof listFeaturedProducts>>[number];

function translateCards(products: CardProduct[]) {
  return Promise.all(
    products.map(async (product) => {
      const item = toProductCardItem(product);
      const [name, categoryName] = await Promise.all([t(item.name), t(item.categoryName)]);
      return { ...item, name, categoryName };
    }),
  );
}

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-sm font-medium text-foreground"
    >
      <span className="relative after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-foreground after:transition-transform after:duration-300 group-hover:after:scale-x-0">
        {children}
      </span>
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

function ProductGrid({ products }: { products: Awaited<ReturnType<typeof translateCards>> }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
      {products.map((product) => (
        <div key={product.slug}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}

// Home orientada a comprar: banner corto, productos de inmediato y solo la
// información que despeja dudas antes de pagar (confianza + FAQ).
export default async function HomePage() {
  const [navCategories, topCategories, latest] = await Promise.all([
    listShopCategories(),
    listFeaturedCategories(2),
    listFeaturedProducts(8),
  ]);
  // Las filas por categoría no repiten lo que ya salió en "Recién llegados".
  const latestIds = latest.map((product) => product.id);
  const categoryProducts = await Promise.all(
    topCategories.map((category) =>
      listFeaturedProducts(4, { categoryId: category.id, excludeIds: latestIds }),
    ),
  );

  const [copy, navNames, topNames, latestItems, categoryItems] = await Promise.all([
    tMany({
      heroEyebrow: "Ropa, bolsos y accesorios",
      heroTitleA: "El lujo que se nota,",
      heroTitleB: "al precio que buscas",
      heroText: "Piezas de alta calidad, seleccionadas una por una. Elige la tuya y recíbela en casa.",
      shopCta: "Comprar ahora",
      allCategories: "Todo",
      categoriesLabel: "Categorías",
      productsEyebrow: "Novedades",
      productsTitle: "Recién llegados",
      viewAll: "Ver todo",
      viewShop: "Ver toda la tienda",
      noProducts: "Aún no hay productos disponibles.",
      promiseQuote: "Si una pieza no pasa nuestra revisión, no llega a la tienda.",
      trust1Title: "Calidad seleccionada",
      trust1Text: "Revisamos costuras, materiales y acabados de cada pieza antes de publicarla.",
      trust2Title: "Reserva por 3 días",
      trust2Text: "Apartamos tu pedido y el inventario mientras confirmas tu pago, sin presión.",
      trust3Title: "Pago seguro",
      trust3Text: "Tarjeta con procesamiento cifrado, o Zelle, Cash App y PayPal verificados a mano.",
      faqEyebrow: "Preguntas frecuentes",
      faqTitle: "Todo claro antes de comprar",
      q1: "¿Qué métodos de pago aceptan?",
      a1: "Tarjeta de crédito o débito (procesada de forma segura), Zelle, Cash App y PayPal. Los pagos manuales se verifican antes de confirmar tu pedido.",
      q2: "¿Cuánto cuesta el envío?",
      a2: "En compras al detalle el envío depende de la cantidad de artículos y lo ves en tu carrito antes de pagar. En pedidos mayoristas coordinamos el envío contigo.",
      q3: "¿Cuánto tiempo tengo para pagar mi pedido?",
      a3: "Tu pedido y su inventario quedan reservados durante 3 días. Si el pago no se confirma en ese plazo, la reserva vence y las piezas vuelven a estar disponibles.",
      q4: "¿Cómo obtengo el precio mayorista?",
      a4: `Solo agrega ${WHOLESALE_ITEM_THRESHOLD} o más artículos a tu carrito —pueden ser distintos productos y tallas—. El precio mayorista se aplica automáticamente a todas las piezas.`,
      q5: "¿Aceptan devoluciones?",
      a5: "Todas las ventas son finales. Si recibes una pieza con daño de fábrica, repórtalo dentro de las primeras 24 horas y lo resolvemos contigo.",
      contactCta: "¿Otra pregunta? Escríbenos",
    }),
    Promise.all(navCategories.map((category) => t(category.name))),
    Promise.all(topCategories.map((category) => t(category.name))),
    translateCards(latest),
    Promise.all(categoryProducts.map(translateCards)),
  ]);

  const trust = [
    { icon: BadgeCheck, title: copy.trust1Title, text: copy.trust1Text },
    { icon: CalendarClock, title: copy.trust2Title, text: copy.trust2Text },
    { icon: ShieldCheck, title: copy.trust3Title, text: copy.trust3Text },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "OnlineStore",
          name: SITE_NAME,
          description: SITE_DESCRIPTION,
          url: SITE_URL,
          logo: `${SITE_URL}/brand/emblem-light.svg`,
          sameAs: [CONTACT.instagram, CONTACT.facebook, CONTACT.tiktok].filter(Boolean),
        }}
      />

      <section className="relative isolate flex h-[26rem] items-center overflow-hidden bg-inverse text-inverse-foreground sm:h-[32rem] lg:h-[34rem]">
        {/* En escritorio la foto arranca a un tercio para que el rostro no
            quede detrás del título. */}
        <div className="absolute inset-0 -z-10 overflow-hidden lg:left-1/3">
          <Image
            src={STOCK_IMAGES.editorial.src}
            alt={STOCK_IMAGES.editorial.alt}
            fill
            priority
            sizes="(min-width: 1024px) 67vw, 100vw"
            className="animate-settle object-cover object-[center_30%]"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,10,11,0.85)_0%,rgba(10,10,11,0.45)_55%,rgba(10,10,11,0.1)_100%)]"
        />
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-5 px-4 sm:px-6">
          <p className="eyebrow animate-fade-up text-inverse-accent">{copy.heroEyebrow}</p>
          <h1 className="max-w-2xl font-display text-4xl leading-[1.05] sm:text-6xl">
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="block animate-rise [animation-delay:80ms]">{copy.heroTitleA}</span>
            </span>{" "}
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="block animate-rise italic text-inverse-accent [animation-delay:200ms]">
                {copy.heroTitleB}
              </span>
            </span>
          </h1>
          <p className="max-w-md animate-fade-up text-inverse-muted [animation-delay:350ms] sm:text-lg">
            {copy.heroText}
          </p>
          <Link href="/tienda" className="animate-fade-up [animation-delay:450ms]">
            <Button size="lg" variant="inverse" className="group">
              {copy.shopCta}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {navCategories.length > 0 && (
        <nav aria-label={copy.categoriesLabel} className="border-b border-border">
          <ul className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-4 [scrollbar-width:none] sm:px-6 lg:justify-center [&::-webkit-scrollbar]:hidden">
            <li>
              <Link href="/tienda" className={filterPillClass(false)}>
                {copy.allCategories}
              </Link>
            </li>
            {navCategories.map((category, index) => (
              <li key={category.id}>
                <Link href={`/tienda?categoria=${category.slug}`} className={filterPillClass(false)}>
                  {navNames[index]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-12 sm:gap-20 sm:px-6 sm:py-16">
        <section className="flex flex-col gap-8">
          <SectionHeading
            eyebrow={copy.productsEyebrow}
            title={copy.productsTitle}
            action={<ArrowLink href="/tienda">{copy.viewAll}</ArrowLink>}
          />
          {latestItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">{copy.noProducts}</p>
          ) : (
            <ProductGrid products={latestItems} />
          )}
        </section>

        {topCategories.map(
          (category, index) =>
            categoryItems[index].length > 0 && (
              <section key={category.id} className="flex flex-col gap-8">
                <SectionHeading
                  title={topNames[index]}
                  action={
                    <ArrowLink href={`/tienda?categoria=${category.slug}`}>{copy.viewAll}</ArrowLink>
                  }
                />
                <ProductGrid products={categoryItems[index]} />
              </section>
            ),
        )}

        <Link href="/tienda" className="self-center">
          <Button size="lg" variant="outline">
            {copy.viewShop}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <section className="bg-inverse text-inverse-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 sm:px-6 sm:py-20">
          <p className="mx-auto max-w-3xl text-center font-display text-3xl leading-tight sm:text-4xl">
            “{copy.promiseQuote}”
          </p>
          <ul className="grid gap-8 sm:grid-cols-3">
            {trust.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-inverse-border text-inverse-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl">{title}</h2>
                <p className="max-w-xs text-sm leading-relaxed text-inverse-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-accent-soft">
        <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading align="center" eyebrow={copy.faqEyebrow} title={copy.faqTitle} />
          <Faq
            items={[
              { question: copy.q1, answer: copy.a1 },
              { question: copy.q2, answer: copy.a2 },
              { question: copy.q3, answer: copy.a3 },
              { question: copy.q4, answer: copy.a4 },
              { question: copy.q5, answer: copy.a5 },
            ]}
          />
          <div className="self-center">
            <ArrowLink href="/contacto">{copy.contactCta}</ArrowLink>
          </div>
        </div>
      </section>
    </>
  );
}
