import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { listShopCategories } from "@/server/services/category-service";
import { WHOLESALE_ITEM_THRESHOLD } from "@/server/services/cart-service";
import { t, tMany } from "@/lib/i18n";
import { CONTACT, SITE_NAME, whatsappUrl } from "@/lib/site";
import { Sello, Wordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { InstallAppCard } from "@/components/layout/InstallAppCard";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/layout/SocialIcons";

const COMPANY_LINKS = [
  { href: "/about", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
  { href: "/tienda", label: "Tienda" },
];

const LEGAL_LINKS = [
  { href: "/politicas/terminos", label: "Términos y condiciones" },
  { href: "/politicas/privacidad", label: "Política de privacidad" },
  { href: "/politicas/devoluciones", label: "Política de devoluciones" },
];

const PAYMENT_METHODS = ["Visa", "Mastercard", "Zelle", "Cash App", "PayPal"];

// Cuántas categorías caben antes de que la columna se vuelva demasiado larga
// — con más que esto, "Ver todas" hacia /tienda cubre el resto sin que el
// footer crezca sin límite a medida que el catálogo crece.
const MAX_FOOTER_CATEGORIES = 8;

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <span className="eyebrow text-inverse-foreground">{title}</span>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex max-w-full items-center text-sm text-inverse-muted transition-colors duration-300 hover:text-inverse-foreground"
    >
      <span
        aria-hidden="true"
        className="h-px w-0 shrink-0 bg-inverse-accent transition-[width,margin] duration-300 group-hover:mr-2 group-hover:w-3"
      />
      <span className="min-w-0 break-words">{children}</span>
    </Link>
  );
}

function SocialButton({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-inverse-border text-inverse-muted transition-[translate,border-color,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-inverse-accent hover:bg-inverse-accent hover:text-inverse"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

export async function SiteFooter() {
  const categories = await listShopCategories();
  const visibleCategories = categories.slice(0, MAX_FOOTER_CATEGORIES);
  const whatsapp = whatsappUrl();
  const hasSocialLinks = Boolean(
    whatsapp || CONTACT.instagram || CONTACT.facebook || CONTACT.tiktok,
  );

  const [copy, categoryNames, companyLabels, legalLabels] = await Promise.all([
    tMany({
      ctaEyebrow: "Glam Luxe by HJ",
      ctaA: "Moda que se nota en los",
      ctaB: "detalles",
      ctaText: "Al detalle o al por mayor, te acompañamos en cada pedido con atención personal.",
      ctaShop: "Ir a la tienda",
      ctaContact: "Escríbenos",
      tagline: `Ropa, bolsos y accesorios de alta calidad, seleccionados pieza por pieza. Precio mayorista desde ${WHOLESALE_ITEM_THRESHOLD} artículos.`,
      categoriesTitle: "Categorías",
      companyTitle: "Empresa",
      legalTitle: "Legal",
      contactTitle: "Atención",
      contactForm: "Formulario de contacto",
      viewAll: "Ver todas",
      rights: "Todos los derechos reservados.",
      secure: "Pagos seguros",
      appTitle: "App Glam Luxe",
      appText: "Instálala gratis y compra desde tu pantalla de inicio.",
      appCta: "Descargar",
      appIosTitle: "Instala la app en tu iPhone",
      appIosStep1: "Toca el botón Compartir de Safari.",
      appIosStep2: "Elige “Agregar a pantalla de inicio”.",
      home: "Inicio",
    }),
    Promise.all(visibleCategories.map((category) => t(category.name))),
    Promise.all(COMPANY_LINKS.map((link) => t(link.label))),
    Promise.all(LEGAL_LINKS.map((link) => t(link.label))),
  ]);

  return (
    <footer className="relative isolate overflow-hidden bg-inverse text-inverse-foreground [--logo-accent:var(--inverse-accent)]">
      <div
        aria-hidden="true"
        className="absolute -right-40 -top-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-inverse-accent/10 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-end gap-8 border-b border-inverse-border py-12 sm:gap-10 sm:py-16 lg:grid-cols-[1.3fr_1fr] lg:py-20">
          <div className="flex flex-col gap-5">
            <span className="eyebrow flex items-center gap-3 text-inverse-accent">
              <span className="h-px w-8 bg-inverse-accent" aria-hidden="true" />
              {copy.ctaEyebrow}
            </span>
            <p className="max-w-2xl font-display text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
              {copy.ctaA} <em className="text-inverse-accent">{copy.ctaB}</em>.
            </p>
          </div>
          <div className="flex flex-col gap-6 lg:items-end lg:text-right">
            <p className="max-w-md text-sm leading-relaxed text-inverse-muted">{copy.ctaText}</p>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <Link href="/tienda">
                <Button variant="inverse" size="lg" className="w-full px-4 sm:w-auto sm:px-7">
                  {copy.ctaShop}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/contacto">
                <Button variant="inverse-outline" size="lg" className="w-full px-4 sm:w-auto sm:px-7">
                  {copy.ctaContact}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Marca: apilada en móvil, en fila a lo ancho en tablet (md) y como
            primera columna en escritorio (lg). */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:py-16 md:grid-cols-12 md:gap-y-12">
          <div className="col-span-2 flex flex-col gap-6 md:col-span-12 md:flex-row md:items-center md:justify-between lg:col-span-4 lg:flex-col lg:items-start lg:justify-start">
            <div className="flex items-center gap-5 lg:flex-col lg:items-start lg:gap-6">
              <Link
                href="/"
                aria-label={`${SITE_NAME} — ${copy.home}`}
                className="shrink-0 transition-transform duration-500 hover:scale-105"
              >
                <Sello className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28" title="" />
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-inverse-muted">{copy.tagline}</p>
            </div>
            <div className="flex flex-col gap-4 md:items-end lg:items-start">
              {hasSocialLinks && (
                <div className="flex items-center gap-2">
                  {whatsapp && <SocialButton href={whatsapp} label="WhatsApp" icon={WhatsAppIcon} />}
                  {CONTACT.instagram && (
                    <SocialButton href={CONTACT.instagram} label="Instagram" icon={InstagramIcon} />
                  )}
                  {CONTACT.facebook && (
                    <SocialButton href={CONTACT.facebook} label="Facebook" icon={FacebookIcon} />
                  )}
                  {CONTACT.tiktok && (
                    <SocialButton href={CONTACT.tiktok} label="TikTok" icon={TikTokIcon} />
                  )}
                </div>
              )}
              <InstallAppCard
                copy={{
                  title: copy.appTitle,
                  text: copy.appText,
                  cta: copy.appCta,
                  iosTitle: copy.appIosTitle,
                  iosStep1: copy.appIosStep1,
                  iosStep2: copy.appIosStep2,
                }}
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div className="md:col-span-3 lg:col-span-2">
              <FooterColumn title={copy.categoriesTitle}>
                {visibleCategories.map((category, index) => (
                  <FooterLink key={category.id} href={`/tienda?categoria=${category.slug}`}>
                    {categoryNames[index]}
                  </FooterLink>
                ))}
                {categories.length > MAX_FOOTER_CATEGORIES && (
                  <FooterLink href="/tienda">{copy.viewAll}</FooterLink>
                )}
              </FooterColumn>
            </div>
          )}

          <div className="md:col-span-3 lg:col-span-2">
            <FooterColumn title={copy.companyTitle}>
              {COMPANY_LINKS.map((link, index) => (
                <FooterLink key={link.href} href={link.href}>
                  {companyLabels[index]}
                </FooterLink>
              ))}
            </FooterColumn>
          </div>

          <div className="md:col-span-3 lg:col-span-2">
            <FooterColumn title={copy.legalTitle}>
              {LEGAL_LINKS.map((link, index) => (
                <FooterLink key={link.href} href={link.href}>
                  {legalLabels[index]}
                </FooterLink>
              ))}
            </FooterColumn>
          </div>

          <div className="md:col-span-3 lg:col-span-2">
            <FooterColumn title={copy.contactTitle}>
              <FooterLink href="/contacto#formulario">{copy.contactForm}</FooterLink>
              {whatsapp && (
                <FooterLink href={whatsapp} external>
                  WhatsApp
                </FooterLink>
              )}
              {CONTACT.email && (
                <FooterLink href={`mailto:${CONTACT.email}`}>{CONTACT.email}</FooterLink>
              )}
            </FooterColumn>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-inverse-border py-6 text-center lg:flex-row lg:text-left">
          <p className="text-xs text-inverse-muted">
            © {new Date().getFullYear()} {SITE_NAME}. {copy.rights}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
            <span className="flex w-full items-center justify-center gap-1.5 text-xs text-inverse-muted sm:mr-1 sm:w-auto">
              <ShieldCheck className="h-4 w-4 text-inverse-accent" aria-hidden="true" />
              {copy.secure}
            </span>
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="rounded-md border border-inverse-border px-2.5 py-1 text-[11px] font-medium text-inverse-muted transition-colors duration-300 hover:border-inverse-muted hover:text-inverse-foreground"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Firma de marca completa al pie: decorativa, sin peso
          en el orden de lectura ni en los links. */}
      <div
        aria-hidden="true"
        className="pointer-events-none px-4 pb-10 pt-2 [--logo-accent:currentColor] sm:px-6 sm:pb-14"
      >
        <Wordmark className="mx-auto h-auto w-full max-w-7xl text-inverse-border/70" title="" />
      </div>
    </footer>
  );
}
