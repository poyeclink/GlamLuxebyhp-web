"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type NavLink = {
  href: string;
  label: string;
};

export function MobileNav({ links, authSlot }: { links: NavLink[]; authSlot: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Sin esto, el scroll dentro del panel (fixed) encadena hacia el body
  // detrás una vez que llega al final de su propio contenido — el bug
  // reportado ("se puede hacer scroll sobre la página principal"). Bloquear
  // el scroll del body mientras el menú está abierto es la forma estándar de
  // evitar ese scroll-chaining, no solo un ajuste del panel.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        // fixed inset-x-0 top-16 bottom-0 (no absolute/height-auto): el panel
        // debe cubrir el 100% del ancho y el alto restante del viewport como
        // una pantalla completa, no un dropdown chico que deja ver el
        // contenido de la página debajo — absolute + altura por contenido
        // dejaba la página visible justo debajo del menú.
        <div className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-border bg-background px-4 py-6">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border pt-4">{authSlot}</div>
          </nav>
        </div>
      )}
    </div>
  );
}
