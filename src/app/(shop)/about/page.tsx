import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Gem,
  HeartHandshake,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Sello } from "@/components/brand/Logo";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Spotlight } from "@/components/motion/Spotlight";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { t, tMany } from "@/lib/i18n";
import { STOCK_IMAGES, type StockImage } from "@/lib/stock-images";
import { WHOLESALE_ITEM_THRESHOLD } from "@/server/services/cart-service";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce Glam Luxe by HJ: ropa, bolsos y accesorios de alta calidad seleccionados pieza por pieza, para compras personales y para boutiques.",
  alternates: { canonical: "/about" },
};

function Eyebrow({ children, inverse }: { children: React.ReactNode; inverse?: boolean }) {
  return (
    <p
      className={`eyebrow flex items-center gap-3 ${inverse ? "text-inverse-accent" : "text-accent"}`}
    >
      <span
        className={`h-px w-8 ${inverse ? "bg-inverse-accent" : "bg-accent"}`}
        aria-hidden="true"
      />
      {children}
    </p>
  );
}

async function AudiencePanel({
  image,
  text,
  points,
}: {
  image: StockImage;
  text: string;
  points: string[];
}) {
  const alt = await t(image.alt);

  return (
    <div className="grid items-center gap-8 rounded-3xl bg-background p-4 shadow-[0_30px_80px_-50px_rgba(10,10,11,0.5)] md:grid-cols-[1fr_1.1fr] md:p-5">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl md:aspect-[4/5]">
        <Image
          src={image.src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 40vw, 100vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-6 px-2 pb-4 md:px-4 md:pb-0">
        <p className="font-display text-2xl leading-snug text-foreground sm:text-3xl">{text}</p>
        <ul className="flex flex-col">
          {points.map((point) => (
            <li
              key={point}
              className="group flex items-center gap-4 border-b border-border py-4 text-sm text-foreground transition-colors last:border-b-0 hover:text-accent"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent transition-colors duration-300 group-hover:bg-inverse group-hover:text-inverse-accent">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default async function AboutPage() {
  const c = await tMany({
    embroideryAlt: STOCK_IMAGES.embroidery.alt,
    tailoringAlt: STOCK_IMAGES.tailoring.alt,
    blousesAlt: STOCK_IMAGES.blouses.alt,
    monochromeCoatAlt: STOCK_IMAGES.monochromeCoat.alt,
    home: "Inicio",
    eyebrow: "Nosotros",
    title: "Moda de alta calidad, elegida con criterio",
    description:
      "Glam Luxe by HJ nace de una idea simple: que vestir bien no dependa de pagar de más. Seleccionamos ropa, bolsos y accesorios con acabados de alta gama y los ponemos a tu alcance, al detalle o al por mayor.",
    manifestoEyebrow: "Nuestra filosofía",
    manifestoA: "Creemos que el lujo no está en la etiqueta, sino en los",
    manifestoB: "detalles",
    manifestoC: "que se sienten al usar una pieza.",
    manifestoCaption: "Lo que no se ve en una foto, se nota al usarla.",
    pillar1: "Materiales",
    pillar1t: "Telas, cueros y herrajes que resisten el uso diario.",
    pillar2: "Confección",
    pillar2t: "Costuras firmes, forros limpios y cortes que caen bien.",
    pillar3: "Acabados",
    pillar3t: "Cierres, bordados y terminaciones cuidadas al detalle.",
    signature: "El equipo de Glam Luxe by HJ",
    signatureRole: "Curaduría y selección",
    manifestoText:
      "Por eso cada prenda, bolso y accesorio que llega a nuestra tienda pasa primero por nuestras manos. No buscamos tener más productos, buscamos tener los correctos.",
    storyEyebrow: "Nuestra historia",
    storyTitle: "Una curaduría personal, no un catálogo infinito",
    story1:
      "Detrás de Glam Luxe hay una mirada exigente: cada pieza que publicamos fue revisada antes por nosotros. Nos fijamos en lo que se nota con el uso —la caída de la tela, las costuras, los herrajes, el forro de un bolso— y no solo en cómo se ve en una foto.",
    story2:
      "Preferimos un catálogo cuidado a uno enorme. Si una pieza no cumple nuestro estándar, simplemente no llega a la tienda.",
    storyQuote: "Si no la usaríamos nosotros, no la vendemos.",
    storyCta: "Ver la colección",
    valuesEyebrow: "Lo que nos define",
    valuesTitle: "Cuatro compromisos con cada cliente",
    v1: "Calidad primero",
    v1t: "Materiales y confección revisados pieza por pieza antes de publicarse.",
    v2: "Precios transparentes",
    v2t: "Ves el precio individual y el mayorista de cada producto, sin letra pequeña.",
    v3: "Trato cercano",
    v3t: "Te acompañamos con tallas, disponibilidad y envíos, de persona a persona.",
    v4: "Compra segura",
    v4t: "Pagos protegidos y cada pedido reservado mientras confirmas tu pago.",
    processEyebrow: "Cómo trabajamos",
    processTitle: "De nuestro proveedor a tus manos",
    processText: "Cuatro pasos que se repiten con cada pieza, sin excepciones.",
    p1: "Selección",
    p1t: "Elegimos proveedores que cumplen nuestros estándares de materiales y confección.",
    p2: "Revisión",
    p2t: "Inspeccionamos cada pieza: costuras, acabados, cierres y medidas.",
    p3: "Empaque",
    p3t: "Preparamos tu pedido con cuidado para que llegue como salió de nuestras manos.",
    p4: "Entrega",
    p4t: "Coordinamos el envío y te mantenemos al tanto del estado de tu pedido.",
    forEyebrow: "Para quién",
    forTitle: "Compra como tú necesites",
    forText:
      "Una sola tienda con la misma calidad, ya sea que busques una pieza para ti o surtir tu negocio.",
    tabPersonal: "Para ti",
    tabBusiness: "Para tu negocio",
    personalText:
      "¿Buscas una pieza especial? Compra al detalle, sin mínimos, con la misma calidad que nuestros clientes mayoristas.",
    personal1: "Sin mínimo de compra",
    personal2: "Tallas y disponibilidad visibles en cada producto",
    personal3: "Envío calculado en tu carrito antes de pagar",
    personal4: "Pagos con tarjeta, Zelle, Cash App o PayPal",
    businessText: `¿Tienes una boutique, vendes por redes o surtes a clientes? Desde ${WHOLESALE_ITEM_THRESHOLD} artículos variados, todo tu pedido pasa a precio mayorista.`,
    business1: `Precio mayorista desde ${WHOLESALE_ITEM_THRESHOLD} artículos, combinando productos`,
    business2: "Sin cuentas especiales ni aprobaciones previas",
    business3: "Envío coordinado directamente contigo",
    business4: "Tu pedido reservado 3 días mientras confirmas el pago",
    ctaEyebrow: "Glam Luxe by HJ",
    ctaTitle: "Descubre piezas que se ven —y se sienten— de alta gama",
    ctaShop: "Ir a la tienda",
    ctaContact: "Hablemos",
  });

  const values = [
    { icon: Gem, title: c.v1, text: c.v1t },
    { icon: Sparkles, title: c.v2, text: c.v2t },
    { icon: HeartHandshake, title: c.v3, text: c.v3t },
    { icon: ShieldCheck, title: c.v4, text: c.v4t },
  ];

  const steps = [
    { icon: Search, title: c.p1, text: c.p1t },
    { icon: BadgeCheck, title: c.p2, text: c.p2t },
    { icon: PackageCheck, title: c.p3, text: c.p3t },
    { icon: Truck, title: c.p4, text: c.p4t },
  ];

  return (
    <>
      <PageHero
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.description}
        image={STOCK_IMAGES.boutiqueRacks}
        breadcrumb={{ home: c.home, current: c.eyebrow }}
      />

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:py-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:py-32">
        <div className="relative">
          <div className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-inverse">
            <Image
              src={STOCK_IMAGES.embroidery.src}
              alt={c.embroideryAlt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,10,11,0.75)_0%,transparent_45%)]"
            />
            <p className="absolute bottom-6 left-6 right-6 font-display text-2xl italic text-inverse-foreground">
              {c.manifestoCaption}
            </p>
          </div>
          <div
            aria-hidden="true"
            className="absolute -right-4 -top-4 -z-10 hidden h-full w-full rounded-[2rem] border border-accent/40 lg:block"
          />
        </div>

        <div className="flex flex-col gap-8">
          <Eyebrow>{c.manifestoEyebrow}</Eyebrow>
          <p className="font-display text-4xl leading-[1.15] text-foreground sm:text-5xl">
            {c.manifestoA} <em className="text-accent">{c.manifestoB}</em> {c.manifestoC}
          </p>
          <p className="max-w-xl leading-relaxed text-muted-foreground">{c.manifestoText}</p>
          <dl className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
            {[
              { title: c.pillar1, text: c.pillar1t },
              { title: c.pillar2, text: c.pillar2t },
              { title: c.pillar3, text: c.pillar3t },
            ].map((pillar, index) => (
              <div
                key={pillar.title}
                className="group flex flex-col gap-2 bg-background p-5 transition-colors duration-300 hover:bg-accent-soft"
              >
                <span className="font-display text-sm text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <dt className="font-display text-xl text-foreground">{pillar.title}</dt>
                <dd className="text-xs leading-relaxed text-muted-foreground">{pillar.text}</dd>
              </div>
            ))}
          </dl>
          <div className="flex items-center gap-4">
            <Sello className="h-16 w-16 shrink-0 text-foreground" />
            <div className="flex flex-col">
              <span className="font-display text-lg text-foreground">{c.signature}</span>
              <span className="text-xs text-muted-foreground">{c.signatureRole}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-accent-soft">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 py-16 sm:py-24 sm:px-6 lg:grid-cols-2 lg:gap-24">
          <div className="relative pb-16 pr-10 sm:pb-20 sm:pr-16">
            <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-inverse">
              <Image
                src={STOCK_IMAGES.tailoring.src}
                alt={c.tailoringAlt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            <div className="group absolute bottom-0 right-0 w-1/2 overflow-hidden rounded-2xl border-8 border-accent-soft shadow-[0_30px_60px_-30px_rgba(10,10,11,0.6)]">
              <div className="relative aspect-square">
                <Image
                  src={STOCK_IMAGES.blouses.src}
                  alt={c.blousesAlt}
                  fill
                  sizes="(min-width: 1024px) 22vw, 50vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
            </div>
            <div className="absolute left-4 top-4 flex h-20 w-20 items-center justify-center rounded-full bg-inverse/85 p-2 text-inverse-foreground backdrop-blur-sm [--logo-accent:var(--inverse-accent)]">
              <Sello className="h-full w-full" />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Eyebrow>{c.storyEyebrow}</Eyebrow>
            <h2 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
              {c.storyTitle}
            </h2>
            <p className="leading-relaxed text-muted-foreground">{c.story1}</p>
            <p className="leading-relaxed text-muted-foreground">{c.story2}</p>
            <blockquote className="border-l-2 border-accent pl-5 font-display text-2xl italic text-foreground">
              “{c.storyQuote}”
            </blockquote>
            <Link href="/tienda" className="w-fit">
              <Button size="lg">
                {c.storyCta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-inverse text-inverse-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 sm:py-24 sm:px-6">
          <div className="flex flex-col gap-3">
            <Eyebrow inverse>{c.valuesEyebrow}</Eyebrow>
            <h2 className="font-display text-4xl sm:text-5xl">{c.valuesTitle}</h2>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-2xl bg-inverse-border sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="bg-inverse">
                <Spotlight className="flex h-full flex-col gap-5 p-8">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-inverse-border text-inverse-accent transition-all duration-500 group-hover/spot:border-inverse-accent group-hover/spot:bg-inverse-accent group-hover/spot:text-inverse">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-display text-sm text-inverse-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl">{title}</h3>
                  <p className="text-sm leading-relaxed text-inverse-muted">{text}</p>
                </Spotlight>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-16 sm:py-24 sm:px-6">
        <div>
          <SectionHeading
            eyebrow={c.processEyebrow}
            title={c.processTitle}
            description={c.processText}
            align="center"
          />
        </div>
        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-border lg:block"
          />
          <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li key={title}>
                <div
                  className="group relative flex flex-col items-center gap-4 text-center"
                >
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-500 group-hover:-translate-y-1 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                      {index + 1}
                    </span>
                  </span>
                  <h3 className="font-display text-2xl text-foreground">{title}</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-accent-soft">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:py-24 sm:px-6">
          <div>
            <SectionHeading
              eyebrow={c.forEyebrow}
              title={c.forTitle}
              description={c.forText}
              align="center"
            />
          </div>
          <Tabs
            items={[
              {
                id: "personal",
                label: c.tabPersonal,
                content: (
                  <AudiencePanel
                    image={STOCK_IMAGES.scarfWoman}
                    text={c.personalText}
                    points={[c.personal1, c.personal2, c.personal3, c.personal4]}
                  />
                ),
              },
              {
                id: "business",
                label: c.tabBusiness,
                content: (
                  <AudiencePanel
                    image={STOCK_IMAGES.boutique}
                    text={c.businessText}
                    points={[c.business1, c.business2, c.business3, c.business4]}
                  />
                ),
              },
            ]}
          />
        </div>
      </section>

      <section className="group relative isolate overflow-hidden bg-inverse text-inverse-foreground">
        <Image
          src={STOCK_IMAGES.monochromeCoat.src}
          alt={c.monochromeCoatAlt}
          fill
          sizes="100vw"
          className="-z-20 object-cover opacity-60 transition-transform duration-[2000ms] group-hover:scale-105"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,10,11,0.95)_0%,rgba(10,10,11,0.6)_60%,rgba(10,10,11,0.3)_100%)]"
        />
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-28 sm:px-6 lg:py-36">
          <div className="flex max-w-2xl flex-col gap-6">
            <Eyebrow inverse>{c.ctaEyebrow}</Eyebrow>
            <h2 className="font-display text-4xl leading-tight sm:text-6xl">{c.ctaTitle}</h2>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link href="/tienda">
                <Button size="lg" variant="inverse" className="w-full sm:w-auto">
                  {c.ctaShop}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contacto">
                <Button size="lg" variant="inverse-outline" className="w-full sm:w-auto">
                  {c.ctaContact}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
