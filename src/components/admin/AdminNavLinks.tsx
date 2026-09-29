"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Inicio", icon: "space_dashboard" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "receipt_long" },
  { href: "/admin/categorias", label: "Categorías", icon: "category" },
  { href: "/admin/productos", label: "Productos", icon: "inventory_2" },
  { href: "/admin/inventario", label: "Inventario", icon: "warehouse" },
  { href: "/admin/envios", label: "Envíos", icon: "local_shipping" },
  { href: "/admin/reportes", label: "Reportes", icon: "monitoring" },
];

// "/admin" necesita coincidencia exacta (si no, siempre se marca activo, ya
// que todas las demás rutas empiezan con ese mismo prefijo); el resto usa
// startsWith para que una subruta como /admin/pedidos/[id] también resalte
// "Pedidos" en el nav.
function isActiveLink(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {ADMIN_LINKS.map((link) => {
        const active = isActiveLink(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-300",
              active
                ? "bg-inverse-foreground/10 text-inverse-foreground"
                : "text-inverse-muted hover:bg-inverse-border/60 hover:text-inverse-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-inverse-accent transition-opacity duration-300",
                active ? "opacity-100" : "opacity-0",
              )}
            />
            <span
              className={cn(
                "material-symbols-outlined text-[20px] leading-none transition-transform duration-300 group-hover:scale-110",
                active && "text-inverse-accent",
              )}
              aria-hidden="true"
            >
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
