import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { StockImage } from "@/lib/stock-images";
import { t } from "@/lib/i18n";

// Altura compartida por los heroes de Nosotros, Contacto y Políticas para que
// el sitio se sienta una sola pieza al navegar entre páginas.
export const HERO_HEIGHT = "min-h-[38rem] lg:h-[46rem] lg:min-h-0";

export async function PageHero({
  eyebrow,
  title,
  description,
  image,
  breadcrumb,
  overlapBottom,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image: StockImage;
  breadcrumb?: { home: string; current: string };
  // Reserva espacio abajo para contenido que se monta sobre el borde del hero.
  overlapBottom?: boolean;
  children?: React.ReactNode;
}) {
  const alt = await t(image.alt);

  const content = (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-16 sm:px-6", overlapBottom && "pb-28 lg:pb-32")}>
      <div className="flex max-w-xl animate-fade-up flex-col gap-5">
        {breadcrumb && (
          <nav aria-label="Ruta" className="flex items-center gap-2 text-xs text-inverse-muted [&_a]:-my-3 [&_a]:inline-block [&_a]:py-3">
            <Link href="/" className="transition-colors hover:text-inverse-foreground">
              {breadcrumb.home}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-inverse-foreground">{breadcrumb.current}</span>
          </nav>
        )}
        {eyebrow && (
          <p className="eyebrow flex items-center gap-3 text-inverse-accent">
            <span className="h-px w-8 bg-inverse-accent" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl">{title}</h1>
        {description && <p className="text-base leading-relaxed text-inverse-foreground/80 sm:text-lg">{description}</p>}
        {children}
      </div>
    </div>
  );

  return (
    <section className={cn("relative isolate flex items-center overflow-hidden bg-inverse text-inverse-foreground", HERO_HEIGHT)}>
      <Image
        src={image.src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
        style={{ objectPosition: image.position }}
      />
      {/* Degradado lateral: oscurece solo la columna del texto (contenido
          centrado en vertical) y deja ver la foto a la derecha. En móvil el
          texto ocupa todo el ancho, así que se oscurece parejo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,10,11,0.9)_0%,rgba(10,10,11,0.65)_100%)] lg:bg-[linear-gradient(90deg,rgba(10,10,11,0.88)_0%,rgba(10,10,11,0.55)_40%,rgba(10,10,11,0.05)_70%)]"
      />
      {content}
    </section>
  );
}
