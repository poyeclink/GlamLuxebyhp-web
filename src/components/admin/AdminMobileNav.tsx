"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoHorizontal } from "@/components/brand/Logo";
import { AdminNavLinks } from "@/components/admin/AdminNavLinks";

export function AdminMobileNav({ userCard }: { userCard: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Mismo bug de scroll-chaining ya corregido en el MobileNav de la tienda:
  // sin bloquear el scroll del body, el contenido de atrás se desplaza desde
  // dentro del panel una vez que este llega al final de su propio contenido.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="sticky top-0 z-40 bg-inverse text-inverse-foreground [--logo-accent:var(--inverse-accent)] md:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/admin" aria-label="Panel admin" onClick={() => setOpen(false)}>
          <LogoHorizontal className="h-9 w-auto" title="" />
        </Link>
        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-inverse-foreground transition-colors hover:bg-inverse-border/60"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {open ? "close" : "menu"}
          </span>
        </button>
      </div>

      {open && (
        // fixed inset-x-0 top-16 bottom-0 (no absolute/altura por contenido):
        // mismo criterio que el MobileNav de la tienda, el panel debe cubrir
        // el resto del viewport como pantalla completa, no un dropdown chico.
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex animate-fade-up flex-col gap-4 overflow-y-auto border-t border-inverse-border bg-inverse px-3 py-4">
          <nav className="flex flex-1 flex-col gap-1">
            <AdminNavLinks onNavigate={() => setOpen(false)} />
          </nav>
          {userCard}
        </div>
      )}
    </div>
  );
}
