"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, X } from "lucide-react";
import { Emblem, Wordmark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
};

export function MobileNav({
  links,
  categoryLinks,
  categoriesLabel,
  authSlot,
}: {
  links: NavLink[];
  categoryLinks: NavLink[];
  categoriesLabel: string;
  authSlot: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Bloquear el scroll del body evita el scroll-chaining del panel (fixed)
  // hacia la página de fondo una vez que llega al final de su contenido.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);
  // Entrada escalonada de cada bloque del panel al abrir.
  const stagger = (index: number) => ({ transitionDelay: open ? `${120 + index * 60}ms` : "0ms" });
  const itemClass = cn(
    "transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
    open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
  );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Abrir menú"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="group -mr-2 flex h-10 w-10 flex-col items-end justify-center gap-1.5 px-2"
      >
        <span className="h-px w-6 bg-foreground" />
        <span className="h-px w-4 bg-foreground transition-[width] duration-300 group-hover:w-6" />
      </button>

      {/* Pantalla completa (fixed inset-0), no un dropdown: con el header
          sticky, un panel anclado a top-16 dejaba franjas de la página
          visibles según el scroll. */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex flex-col overflow-hidden bg-inverse text-inverse-foreground [--logo-accent:var(--inverse-accent)]",
          "transition-[opacity,visibility] duration-500",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!open}
        inert={!open}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-inverse-accent/15 blur-3xl"
        />
        <Emblem
          aria-hidden="true"
          title=""
          className="pointer-events-none absolute -bottom-24 -right-24 -z-10 h-80 w-80 text-inverse-border/60 [--logo-accent:var(--inverse-border)]"
        />

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-inverse-border px-4 sm:px-6">
          <Link href="/" onClick={close} aria-label="Inicio">
            <Wordmark className="h-10 w-auto text-inverse-foreground" />
          </Link>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-inverse-border transition-colors duration-300 hover:border-inverse-accent hover:text-inverse-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-10 sm:px-10">
          <ul className="flex flex-col">
            {links.map((link, index) => (
              <li key={link.href} style={stagger(index)} className={itemClass}>
                <Link
                  href={link.href}
                  onClick={close}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className="group flex items-baseline gap-4 border-b border-inverse-border py-4 aria-[current=page]:text-inverse-accent"
                >
                  <span className="text-[0.6875rem] font-semibold tracking-[0.2em] text-inverse-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-4xl sm:text-5xl">{link.label}</span>
                  <ArrowUpRight className="ml-auto h-5 w-5 self-center text-inverse-muted transition-[rotate,color] duration-300 group-hover:rotate-45 group-hover:text-inverse-accent" />
                </Link>
              </li>
            ))}
          </ul>

          {categoryLinks.length > 0 && (
            <div style={stagger(links.length)} className={cn("mt-10", itemClass)}>
              <p className="eyebrow text-[0.625rem] text-inverse-muted">{categoriesLabel}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {categoryLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      className="block rounded-full border border-inverse-border px-4 py-2 text-sm text-inverse-foreground transition-colors duration-300 hover:border-inverse-accent hover:text-inverse-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        <div
          style={stagger(links.length + 1)}
          className={cn("border-t border-inverse-border px-6 py-6 sm:px-10", itemClass)}
          onClick={close}
        >
          {authSlot}
        </div>
      </div>
    </div>
  );
}
