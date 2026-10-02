"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDismiss } from "@/hooks/use-dismiss";
import { navItemClass } from "@/components/layout/MainNav";

type Subcategory = { id: string; name: string; slug: string };
type Category = Subcategory & { children: Subcategory[] };

export function CategoryMenu({
  categories,
  label,
  viewAllLabel,
  promoTitle,
  promoText,
}: {
  categories: Category[];
  label: string;
  viewAllLabel: string;
  promoTitle: string;
  promoText: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(containerRef, open, close);

  if (categories.length === 0) return null;

  return (
    // Solo click (sin abrir por hover): hover + click-toggle se anulaban entre
    // sí, y en tablets un tap dispara ambos a la vez.
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        className={navItemClass}
      >
        {label}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "absolute left-1/2 top-full z-40 mt-[1.1875rem] w-[42rem] -translate-x-1/2 origin-top overflow-hidden rounded-b-2xl border border-t-0 border-border bg-background shadow-[0_30px_70px_-25px_rgba(10,10,11,0.35)]",
          "transition-[opacity,translate,scale,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-2 scale-[0.98] opacity-0",
        )}
      >
        <span
          aria-hidden="true"
          className="block h-px bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]"
        />
        <div className="grid grid-cols-[1fr_14rem] gap-2 p-2">
          <div className="p-5">
            <p className="eyebrow text-[0.625rem] text-muted-foreground">{label}</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-8">
              {categories.map((category) => (
                <li key={category.id} className="border-b border-border/70">
                  <Link
                    href={`/tienda?categoria=${category.slug}`}
                    onClick={close}
                    className="group/item flex items-center justify-between gap-3 py-3 font-display text-lg text-foreground transition-colors duration-300 hover:text-accent"
                  >
                    {category.name}
                    <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-accent opacity-0 transition-[translate,opacity] duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                  </Link>
                  {category.children.length > 0 && (
                    <ul className="-mt-1 flex flex-wrap gap-x-4 gap-y-1 pb-3">
                      {category.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/tienda?categoria=${child.slug}`}
                            onClick={close}
                            className="text-xs text-muted-foreground transition-colors duration-300 hover:text-accent"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/tienda"
            onClick={close}
            className="group/promo relative isolate flex flex-col justify-between gap-6 overflow-hidden rounded-xl bg-inverse p-6 text-inverse-foreground"
          >
            <span
              aria-hidden="true"
              className="absolute -right-10 -top-10 -z-10 h-32 w-32 rounded-full bg-inverse-accent/20 blur-2xl transition-transform duration-700 group-hover/promo:scale-150"
            />
            <div className="flex flex-col gap-2">
              <span aria-hidden="true" className="text-xs text-inverse-accent">
                ✦
              </span>
              <span className="font-display text-xl leading-tight">{promoTitle}</span>
              <span className="text-xs leading-relaxed text-inverse-muted">{promoText}</span>
            </div>
            <span className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-inverse-accent">
              {viewAllLabel}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/promo:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
