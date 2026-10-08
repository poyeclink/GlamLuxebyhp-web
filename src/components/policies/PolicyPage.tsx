import Link from "next/link";
import { getLocale, t, tMany } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/marketing/PageHero";
import { PolicyToc } from "@/components/policies/PolicyToc";
import { STOCK_IMAGES, type StockImage } from "@/lib/stock-images";

export type PolicySection = { id: string; title: string; body: string[] };

const POLICY_IMAGES: Record<string, StockImage> = {
  "/politicas/terminos": STOCK_IMAGES.boutiqueMinimal,
  "/politicas/privacidad": STOCK_IMAGES.pearlBox,
  "/politicas/devoluciones": STOCK_IMAGES.heels,
};

export const POLICY_LINKS = [
  { href: "/politicas/terminos", label: "Términos y condiciones" },
  { href: "/politicas/privacidad", label: "Política de privacidad" },
  { href: "/politicas/devoluciones", label: "Política de devoluciones" },
];

// Fecha visible de la última revisión del texto legal — actualizarla cada vez
// que cambie el contenido de cualquiera de las tres políticas.
export const POLICIES_UPDATED_AT = new Date("2026-10-08T12:00:00Z");

export async function PolicyPage({
  href,
  title,
  intro,
  sections,
}: {
  href: string;
  title: string;
  intro: string;
  sections: PolicySection[];
}) {
  const [c, translated, policyLabels] = await Promise.all([
    tMany({
      home: "Inicio",
      eyebrow: "Políticas",
      title,
      intro,
      updated: "Última actualización",
      toc: "En esta página",
      other: "Políticas",
    }),
    Promise.all(
      sections.map(async (section) => ({
        id: section.id,
        title: await t(section.title),
        body: await Promise.all(section.body.map((paragraph) => t(paragraph))),
      })),
    ),
    Promise.all(POLICY_LINKS.map((link) => t(link.label))),
  ]);

  const updatedAt = new Intl.DateTimeFormat((await getLocale()) === "es" ? "es-ES" : "en-US", {
    dateStyle: "long",
  }).format(POLICIES_UPDATED_AT);

  return (
    <>
      <PageHero
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.intro}
        image={POLICY_IMAGES[href]}
        breadcrumb={{ home: c.home, current: c.title }}
      >
        <p className="text-xs text-inverse-foreground/70">
          {c.updated}:{" "}
          <time dateTime={POLICIES_UPDATED_AT.toISOString().slice(0, 10)}>{updatedAt}</time>
        </p>
      </PageHero>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20 lg:py-20">
        <aside className="flex min-w-0 flex-col gap-10 lg:sticky lg:top-24 lg:self-start">
          <nav
            aria-label={c.other}
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:flex-col lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {POLICY_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={link.href === href ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors lg:rounded-md",
                  link.href === href
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {policyLabels[index]}
              </Link>
            ))}
          </nav>
          <div className="hidden lg:block">
            <PolicyToc
              title={c.toc}
              sections={translated.map(({ id, title }) => ({ id, title }))}
            />
          </div>
        </aside>

        <article className="flex min-w-0 max-w-3xl flex-col gap-12">
          {translated.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="font-display text-2xl text-foreground">
                <span className="mr-3 text-accent">{String(index + 1).padStart(2, "0")}</span>
                {section.title}
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
