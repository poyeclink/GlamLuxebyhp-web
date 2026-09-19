"use client";

import { useEffect, useState } from "react";
import { AdminNavLinks } from "@/components/admin/AdminNavLinks";
import { AdminLogoutButton } from "@/components/auth/AdminLogoutButton";

export function AdminMobileNav() {
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
    <div className="border-b border-border bg-background md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <span className="text-sm font-semibold text-foreground">GlamLuxeByHp Admin</span>
        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-9 w-9 items-center justify-center text-foreground"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {open ? "close" : "menu"}
          </span>
        </button>
      </div>

      {open && (
        // fixed inset-x-0 top-14 bottom-0 (no absolute/altura por contenido):
        // mismo criterio que el MobileNav de la tienda, el panel debe cubrir
        // el resto del viewport como pantalla completa, no un dropdown chico.
        <div className="fixed inset-x-0 top-14 bottom-0 z-40 flex flex-col overflow-y-auto border-t border-border bg-background px-3 py-4">
          <nav className="flex flex-1 flex-col gap-1">
            <AdminNavLinks onNavigate={() => setOpen(false)} />
          </nav>
          <div className="border-t border-border pt-3">
            <AdminLogoutButton className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
