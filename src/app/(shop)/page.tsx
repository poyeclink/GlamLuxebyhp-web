import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { HeroChrome } from "@/components/brand/Logo";
import { CategoryCard } from "@/components/shop/CategoryCard";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { HERO_HEIGHT } from "@/components/marketing/PageHero";
import { STOCK_IMAGES } from "@/lib/stock-images";
import { cn } from "@/lib/utils";
import { Faq } from "@/components/marketing/Faq";
import { TierSimulator } from "@/components/marketing/TierSimulator";
import { JsonLd } from "@/components/seo/JsonLd";
import { Spotlight } from "@/components/motion/Spotlight";
import { TiltPanel } from "@/components/motion/TiltPanel";
import { Marquee } from "@/components/motion/Marquee";
import { t, tMany } from "@/lib/i18n";
import { CONTACT, SITE_DESCRIPTION, SITE_NAME, SITE_URL, whatsappUrl } from "@/lib/site";
import { WHOLESALE_ITEM_THRESHOLD } from "@/server/services/cart-service";
import { listFeaturedCategories } from "@/server/services/category-service";
import { listFeaturedProducts, toProductCardItem } from "@/server/services/product-service";
import { listShippingRates } from "@/server/services/shipping-service";
import { RESERVATION_DAYS } from "@/server/services/order-service";
import { PAYMENT_METHOD_OPTIONS } from "@/server/services/payment-service";

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

export default async function HomePage() {
  const [categories, products, shippingRates] = await Promise.all([
    listFeaturedCategories(),
    listFeaturedProducts(),
    listShippingRates(),
  ]);

  const [copy, categoryNames, productItems] = await Promise.all([
    tMany({
      heroEyebrow: "Moda y accesorios de alta calidad",
      heroTitleA: "El lujo que se nota,",
      heroTitleB: "al precio que buscas",
      heroText: `Ropa, bolsos y accesorios seleccionados pieza por pieza. Compra una sola prenda o surte tu negocio con precio mayorista desde ${WHOLESALE_ITEM_THRESHOLD} artículos.`,
      shopCta: "Explorar la tienda",
      wholesaleCta: "Cómo funciona el mayorista",
      heroStat1: "artículos para precio mayorista",
      heroStat2: "días de reserva para pagar",
      heroStat3: "métodos de pago",
      heroSeal: "Explorar la tienda · Glam Luxe by HP ·",
      f1Title: "Calidad seleccionada",
      f1Text: "Revisamos costuras, materiales y acabados de cada pieza antes de publicarla.",
      f2Title: "Precio mayorista automático",
      f2Text: `Desde ${WHOLESALE_ITEM_THRESHOLD} artículos variados, todo tu carrito cambia a precio mayorista.`,
      f3Title: "Reserva por 3 días",
      f3Text: "Apartamos tu pedido y el inventario mientras confirmas tu pago, sin presión.",
      f4Title: "Pago seguro",
      f4Text: "Tarjeta con procesamiento cifrado, o Zelle, Cash App y PayPal verificados a mano.",
      categoriesEyebrow: "Colecciones",
      categoriesTitle: "Compra por categoría",
      viewShop: "Ver toda la tienda",
      noCategories: "Aún no hay categorías con productos.",
      productsEyebrow: "Novedades",
      productsTitle: "Recién llegados",
      viewAll: "Ver todo",
      noProducts: "Aún no hay productos disponibles.",
      wholesaleEyebrow: "Mayorista y detalle",
      wholesaleTitle: "Una sola tienda, dos formas de comprar",
      wholesaleText: `No necesitas una cuenta especial ni un mínimo por referencia: combina las piezas que quieras y, al llegar a ${WHOLESALE_ITEM_THRESHOLD} artículos, el precio mayorista se aplica solo a todo tu carrito.`,
      step1: "Elige las piezas que quieras, de cualquier categoría.",
      step2: `Al sumar ${WHOLESALE_ITEM_THRESHOLD} artículos, se aplica el precio mayorista.`,
      step3: "Confirma tu pedido: lo reservamos 3 días mientras pagas.",
      simTitle: "Simula tu pedido",
      simItems: "Artículos en tu carrito",
      simIndividual: "Precio individual",
      simWholesale: "Precio mayorista",
      simShipping: "Envío estimado",
      simCoordinated: "se coordina contigo",
      simRemaining: "Agrega {count} artículo(s) más para desbloquear el precio mayorista.",
      simUnlocked: "¡Precio mayorista desbloqueado en todo tu carrito!",
      promiseEyebrow: "Nuestra promesa",
      promiseQuote: "Si una pieza no pasa nuestra revisión, no llega a la tienda.",
      promiseText:
        "Trabajamos con proveedores que cumplen nuestros estándares de materiales y confección, y revisamos cada prenda, bolso y accesorio antes de publicarlo.",
      aboutCta: "Conoce nuestra historia",
      faqEyebrow: "Preguntas frecuentes",
      faqTitle: "Todo claro antes de comprar",
      faqText: "Lo que más nos preguntan sobre precios, pagos, envíos y devoluciones.",
      q1: "¿Cómo obtengo el precio mayorista?",
      a1: `Solo agrega ${WHOLESALE_ITEM_THRESHOLD} o más artículos a tu carrito —pueden ser distintos productos y tallas—. El precio mayorista se aplica automáticamente a todas las piezas.`,
      q2: "¿Qué métodos de pago aceptan?",
      a2: "Tarjeta de crédito o débito (procesada de forma segura), Zelle, Cash App y PayPal. Los pagos manuales se verifican antes de confirmar tu pedido.",
      q3: "¿Cuánto tiempo tengo para pagar mi pedido?",
      a3: "Tu pedido y su inventario quedan reservados durante 3 días. Si el pago no se confirma en ese plazo, la reserva vence y las piezas vuelven a estar disponibles.",
      q4: "¿Cuánto cuesta el envío?",
      a4: "En compras al detalle el envío depende de la cantidad de artículos y lo ves en tu carrito antes de pagar. En pedidos mayoristas coordinamos el envío contigo.",
      q5: "¿Aceptan devoluciones?",
      a5: "Todas las ventas son finales. Si recibes una pieza con daño de fábrica, repórtalo dentro de las primeras 24 horas y lo resolvemos contigo.",
      contactTitle: "¿Compras para tu boutique o negocio?",
      contactText: "Te asesoramos con tallas, disponibilidad y envíos para pedidos grandes.",
      contactCta: "Escríbenos",
      heroBadge: `Precio mayorista desde ${WHOLESALE_ITEM_THRESHOLD} artículos`,
      heroCard: "Bolsos, ropa y accesorios",
      marquee1: "Ropa de alta calidad",
      marquee2: "Bolsos seleccionados",
      marquee3: "Accesorios que elevan",
      marquee4: `Mayorista desde ${WHOLESALE_ITEM_THRESHOLD} artículos`,
      marquee5: "Revisado pieza por pieza",
      lookEyebrow: "Inspiración",
      lookTitle: "El estilo Glam Luxe",
      lookText:
        "Piezas pensadas para combinarse entre sí: arma tu look completo o surte tu boutique con una sola compra.",
      look1: "Prendas",
      look1t: "Blusas, vestidos y pantalones",
      look2: "Bolsos",
      look2t: "Cuero, estructura y acabados",
      look3: "Detalles",
      look3t: "Accesorios que completan el look",
    }),
    Promise.all(categories.map((category) => t(category.name))),
    Promise.all(
      products.map(async (product) => {
        const item = toProductCardItem(product);
        const [name, categoryName] = await Promise.all([t(item.name), t(item.categoryName)]);
        return { ...item, name, categoryName };
      }),
    ),
  ]);

  const whatsapp = whatsappUrl();
  const individualRates = shippingRates
    .filter((rate) => rate.tier === "individual")
    .map((rate) => ({
      minQuantity: rate.minQuantity,
      maxQuantity: rate.maxQuantity,
      price: Number(rate.price),
    }));

  const features = [
    { title: copy.f1Title, text: copy.f1Text },
    { title: copy.f2Title, text: copy.f2Text },
    { title: copy.f3Title, text: copy.f3Text },
    { title: copy.f4Title, text: copy.f4Text },
  ];

  const contactButton = (
    <Button variant="outline" className="w-full sm:w-auto">
      {copy.contactCta}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );

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

      {/* Hero editorial: título que sube línea por línea, collage de fotos que
          se destapan y el logo cromado en su propio panel Negro Noche (la
          pieza D del branding está pensada solo sobre negro). */}
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px)] bg-[size:7rem_100%] [mask-image:radial-gradient(ellipse_80%_70%_at_20%_0%,black,transparent)]"
        />
        <div
          className={cn(
            "mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:py-10",
            HERO_HEIGHT,
          )}
        >
          <div className="flex flex-col gap-7">
            <p className="eyebrow flex animate-fade-up items-center gap-3 text-accent">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-accent" />
              </span>
              {copy.heroEyebrow}
            </p>
            <h1 className="font-display text-5xl leading-[1.04] text-foreground sm:text-6xl lg:text-[3.5rem] xl:text-[4.25rem]">
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="block animate-rise [animation-delay:80ms]">{copy.heroTitleA}</span>
              </span>{" "}
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="block animate-rise italic text-accent [animation-delay:200ms]">
                  {copy.heroTitleB}
                </span>
              </span>
            </h1>
            <p className="max-w-lg animate-fade-up text-base leading-relaxed text-muted-foreground [animation-delay:350ms] sm:text-lg">
              {copy.heroText}
            </p>
            <div className="flex animate-fade-up flex-col gap-3 [animation-delay:450ms] sm:flex-row">
              <Link href="/tienda">
                <Button size="lg" className="group w-full sm:w-auto">
                  {copy.shopCta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#mayorista">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {copy.wholesaleCta}
                </Button>
              </Link>
            </div>
            <dl className="grid animate-fade-up grid-cols-3 divide-x divide-border border-t border-border pt-6 [animation-delay:550ms]">
              {[
                { value: `${WHOLESALE_ITEM_THRESHOLD}+`, label: copy.heroStat1 },
                { value: String(RESERVATION_DAYS), label: copy.heroStat2 },
                { value: String(PAYMENT_METHOD_OPTIONS.length), label: copy.heroStat3 },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse gap-1 px-4 first:pl-0">
                  <dt className="text-xs leading-snug text-muted-foreground">{stat.label}</dt>
                  <dd className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative h-[30rem] sm:h-[36rem] lg:h-full lg:py-4">
            <div className="grid h-full grid-cols-5 grid-rows-6 gap-3">
              <div className="relative col-span-3 row-span-6 animate-unveil overflow-hidden rounded-[2rem] bg-inverse">
                <Image
                  src={STOCK_IMAGES.editorial.src}
                  alt={STOCK_IMAGES.editorial.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 30vw, 60vw"
                  className="animate-settle object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,10,11,0.55)_0%,transparent_40%)]"
                />
                <p className="absolute left-4 top-4 hidden items-center gap-1.5 rounded-full sm:flex bg-background/90 px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-[0_10px_30px_-12px_rgba(10,10,11,0.5)]">
                  <span className="text-accent">✦</span> {copy.heroBadge}
                </p>
                <Link
                  href="/tienda"
                  className="group absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl bg-background/90 px-4 py-3 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-background"
                >
                  {copy.heroCard}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>

              <TiltPanel className="col-span-2 row-span-4 animate-unveil [animation-delay:150ms]">
                <div className="relative isolate flex h-full items-center justify-center overflow-hidden rounded-[2rem] bg-inverse p-5">
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 -z-10 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-inverse-accent/25 blur-3xl [animation-duration:6s]"
                  />
                  <HeroChrome className="h-auto w-full max-w-[15rem]" />
                </div>
              </TiltPanel>

              <div className="relative col-span-2 row-span-2 animate-unveil overflow-hidden rounded-[2rem] bg-inverse [animation-delay:300ms]">
                <Image
                  src={STOCK_IMAGES.structuredBag.src}
                  alt={STOCK_IMAGES.structuredBag.alt}
                  fill
                  sizes="(min-width: 1024px) 20vw, 40vw"
                  className="animate-settle object-cover"
                />
              </div>
            </div>

            {/* Sello giratorio montado sobre el borde del collage. */}
            <Link
              href="/tienda"
              aria-label={copy.shopCta}
              className="group absolute -left-12 top-1/2 hidden h-28 w-28 -translate-y-1/2 animate-fade-up items-center justify-center rounded-full bg-background shadow-[0_20px_50px_-20px_rgba(10,10,11,0.5)] [animation-delay:700ms] lg:flex"
            >
              <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 h-full w-full animate-spin-slow text-foreground">
                <defs>
                  <path id="hero-seal" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                </defs>
                <text className="fill-current text-[8px] font-semibold uppercase">
                  <textPath href="#hero-seal" textLength="238" lengthAdjust="spacing">
                    {copy.heroSeal}
                  </textPath>
                </text>
              </svg>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <Marquee
        className="border-y border-border py-6 text-foreground"
        items={[copy.marquee1, copy.marquee2, copy.marquee3, copy.marquee4, copy.marquee5]}
      />

      {/* gap-px sobre bg-border = divisores de 1px entre celdas en cualquier
          número de columnas, sin reglas de borde por breakpoint. */}
      <section className="bg-inverse text-inverse-foreground">
        <ul className="mx-auto grid max-w-7xl gap-px bg-inverse-border sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <li key={feature.title} className="bg-inverse">
              <Spotlight className="flex h-full flex-col gap-3 px-6 py-9 sm:px-8 sm:py-12">
                <span className="font-display text-sm text-inverse-accent transition-transform duration-500 group-hover/spot:translate-x-1">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-xl transition-colors duration-500 group-hover/spot:text-inverse-accent">
                  {feature.title}
                </h2>
                <p className="text-sm leading-relaxed text-inverse-muted">{feature.text}</p>
                <span
                  aria-hidden="true"
                  className="mt-2 h-px w-8 bg-inverse-accent transition-[width] duration-500 group-hover/spot:w-16"
                />
              </Spotlight>
            </li>
          ))}
        </ul>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 sm:px-6">
        <section className="flex flex-col gap-10">
          <div>
            <SectionHeading
              eyebrow={copy.categoriesEyebrow}
              title={copy.categoriesTitle}
              action={<ArrowLink href="/tienda">{copy.viewShop}</ArrowLink>}
            />
          </div>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">{copy.noCategories}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category, index) => (
                <div key={category.id}>
                  <CategoryCard
                    index={index}
                    category={{
                      slug: category.slug,
                      name: categoryNames[index],
                      productCount: category._count.products,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section
        id="mayorista"
        className="relative isolate scroll-mt-20 overflow-hidden bg-inverse text-inverse-foreground"
      >
        <div
          aria-hidden="true"
          className="absolute -left-40 top-0 -z-10 h-[30rem] w-[30rem] rounded-full bg-inverse-accent/10 blur-3xl"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:py-24 sm:px-6 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-6">
            <p className="eyebrow text-inverse-accent">{copy.wholesaleEyebrow}</p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              {copy.wholesaleTitle}
            </h2>
            <p className="leading-relaxed text-inverse-muted">{copy.wholesaleText}</p>
            <ol className="flex flex-col gap-4">
              {[copy.step1, copy.step2, copy.step3].map((step, index) => (
                <li
                  key={step}
                  className="group flex items-start gap-4 rounded-xl border border-transparent p-3 transition-colors duration-300 hover:border-inverse-border hover:bg-inverse-border/30"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-inverse-accent font-display text-inverse-accent transition-colors duration-300 group-hover:bg-inverse-accent group-hover:text-inverse">
                    {index + 1}
                  </span>
                  <span className="pt-1 text-sm text-inverse-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-xl">{copy.simTitle}</h3>
            <TierSimulator
              threshold={WHOLESALE_ITEM_THRESHOLD}
              individualRates={individualRates}
              copy={{
                itemsLabel: copy.simItems,
                individual: copy.simIndividual,
                wholesale: copy.simWholesale,
                shipping: copy.simShipping,
                shippingCoordinated: copy.simCoordinated,
                remaining: copy.simRemaining,
                unlocked: copy.simUnlocked,
              }}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 sm:px-6">
        <section className="flex flex-col gap-10">
          <div>
            <SectionHeading
              eyebrow={copy.productsEyebrow}
              title={copy.productsTitle}
              action={<ArrowLink href="/tienda">{copy.viewAll}</ArrowLink>}
            />
          </div>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">{copy.noProducts}</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
              {productItems.map((product, index) => (
                <div key={products[index].id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="bg-accent-soft">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:py-24 sm:px-6">
          <div>
            <SectionHeading
              eyebrow={copy.lookEyebrow}
              title={copy.lookTitle}
              description={copy.lookText}
              action={<ArrowLink href="/tienda">{copy.viewShop}</ArrowLink>}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:grid-rows-2 lg:h-[40rem]">
            {[
              {
                image: STOCK_IMAGES.clothingRack,
                title: copy.look1,
                text: copy.look1t,
                className: "md:row-span-2",
              },
              { image: STOCK_IMAGES.handbags, title: copy.look2, text: copy.look2t, className: "" },
              { image: STOCK_IMAGES.goldJewelry, title: copy.look3, text: copy.look3t, className: "" },
            ].map((tile) => (
              <div
                key={tile.title}
                className={cn("min-h-72", tile.className)}
              >
                <Link
                  href="/tienda"
                  className="group relative flex h-full min-h-72 overflow-hidden rounded-3xl bg-inverse text-inverse-foreground"
                >
                  <Image
                    src={tile.image.src}
                    alt={tile.image.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,10,11,0.85)_0%,rgba(10,10,11,0.1)_60%)]"
                  />
                  <div className="relative mt-auto flex w-full items-end justify-between gap-4 p-6 sm:p-8">
                    <div className="flex flex-col gap-1">
                      <span className="font-display text-3xl sm:text-4xl">{tile.title}</span>
                      <span className="text-sm text-inverse-foreground/80 transition-all duration-500 sm:max-h-0 sm:overflow-hidden sm:opacity-0 sm:group-hover:max-h-10 sm:group-hover:opacity-100">
                        {tile.text}
                      </span>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-inverse-foreground text-inverse transition-all duration-500 group-hover:rotate-45 group-hover:bg-inverse-accent">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid bg-inverse text-inverse-foreground lg:grid-cols-2">
        <div className="relative min-h-80 lg:min-h-[36rem]">
          <Image
            src={STOCK_IMAGES.blackGown.src}
            alt={STOCK_IMAGES.blackGown.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-6 px-6 py-20 sm:px-12 lg:px-20">
          <p className="eyebrow flex items-center gap-3 text-inverse-accent">
            <span className="h-px w-8 bg-inverse-accent" aria-hidden="true" />
            {copy.promiseEyebrow}
          </p>
          <blockquote className="font-display text-4xl leading-tight sm:text-5xl">
            “{copy.promiseQuote}”
          </blockquote>
          <p className="max-w-lg leading-relaxed text-inverse-muted">{copy.promiseText}</p>
          <Link href="/about" className="w-fit">
            <Button variant="inverse-outline">
              {copy.aboutCta}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="bg-accent-soft">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:py-24 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow={copy.faqEyebrow}
              title={copy.faqTitle}
              description={copy.faqText}
            />
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-7">
              <p className="font-display text-2xl text-foreground">{copy.contactTitle}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{copy.contactText}</p>
              {whatsapp ? (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  {contactButton}
                </a>
              ) : (
                <Link href="/contacto">{contactButton}</Link>
              )}
            </div>
          </div>
          <Faq
            items={[
              { question: copy.q1, answer: copy.a1 },
              { question: copy.q2, answer: copy.a2 },
              { question: copy.q3, answer: copy.a3 },
              { question: copy.q4, answer: copy.a4 },
              { question: copy.q5, answer: copy.a5 },
            ]}
          />
        </div>
      </section>
    </>
  );
}
