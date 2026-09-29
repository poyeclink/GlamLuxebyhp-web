import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Emblem } from "@/components/brand/Logo";
import type { StockImage } from "@/lib/stock-images";

// Pantalla dividida para login/registro: foto de marca en Negro Noche (solo
// desde lg:, en móvil el formulario ocupa todo) + formulario.
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  brandTitle,
  brandPoints,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  brandTitle: string;
  brandPoints: string[];
  image: StockImage;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 p-3 sm:p-4 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative isolate hidden flex-col justify-between overflow-hidden rounded-[2rem] bg-inverse p-12 text-inverse-foreground [--logo-accent:var(--inverse-accent)] lg:flex">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="50vw"
          className="-z-20 object-cover opacity-60"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,rgba(10,10,11,0.55)_0%,rgba(10,10,11,0.95)_75%)]"
        />
        <Link
          href="/"
          aria-label="Inicio"
          className="w-fit transition-transform duration-500 hover:scale-105"
        >
          <Emblem className="h-20 w-20" title="" />
        </Link>
        <div className="flex max-w-md flex-col gap-8">
          <p className="font-display text-5xl leading-[1.1]">{brandTitle}</p>
          <ul className="flex flex-col gap-4">
            {brandPoints.map((point) => (
              <li
                key={point}
                className="flex items-center gap-3 text-sm text-inverse-foreground/85"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-inverse-accent/60 text-inverse-accent">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex flex-col justify-center px-2 py-12 sm:px-12 lg:py-16">
        <div className="mx-auto flex w-full max-w-sm animate-fade-up flex-col gap-8">
          <div className="flex flex-col gap-3">
            <span className="eyebrow flex items-center gap-3 text-accent">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              {eyebrow}
            </span>
            <h1 className="font-display text-4xl text-foreground sm:text-5xl">{title}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
