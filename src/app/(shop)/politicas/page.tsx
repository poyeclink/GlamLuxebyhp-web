import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, RotateCcw, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/marketing/PageHero";
import { t, tMany } from "@/lib/i18n";
import { STOCK_IMAGES } from "@/lib/stock-images";

export async function generateMetadata(): Promise<Metadata> {
  const [title, description] = await Promise.all([
    t("Políticas y términos"),
    t("Términos y condiciones, política de privacidad y política de devoluciones de Glam Luxe by HJ."),
  ]);
  return { title, description, alternates: { canonical: "/politicas" } };
}

export default async function PoliciesIndexPage() {
  const c = await tMany({
    home: "Inicio",
    eyebrow: "Transparencia",
    title: "Políticas y términos",
    description:
      "Todo lo que necesitas saber sobre cómo compras, cómo cuidamos tus datos y qué pasa si una pieza llega dañada.",
    terms: "Términos y condiciones",
    termsText: "Precios, precio mayorista, pagos y envíos.",
    privacy: "Política de privacidad",
    privacyText: "Qué datos usamos, para qué y cómo los protegemos.",
    returns: "Política de devoluciones",
    returnsText: "Venta final con garantía por daño de fábrica reportado en 24 horas.",
    read: "Leer",
  });

  const policies = [
    { href: "/politicas/terminos", title: c.terms, text: c.termsText, icon: FileText },
    { href: "/politicas/privacidad", title: c.privacy, text: c.privacyText, icon: ShieldCheck },
    { href: "/politicas/devoluciones", title: c.returns, text: c.returnsText, icon: RotateCcw },
  ];

  return (
    <>
      <PageHero
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.description}
        image={STOCK_IMAGES.silk}
        breadcrumb={{ home: c.home, current: c.title }}
      />
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-3 lg:py-24">
        {policies.map(({ href, title, text, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-4 rounded-xl border border-border p-6 hover-lift hover:border-accent hover:shadow-lg hover:shadow-foreground/5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-display text-xl text-foreground">{title}</h2>
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
            <span className="flex items-center gap-1.5 text-sm font-medium text-accent">
              {c.read}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
