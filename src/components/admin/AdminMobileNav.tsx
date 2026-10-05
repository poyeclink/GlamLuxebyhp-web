"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoHorizontal } from "@/components/brand/Logo";
import { ADMIN_LINKS, AdminNavLinks, isActiveLink } from "@/components/admin/AdminNavLinks";
import { cn } from "@/lib/utils";

const TAB_HREFS = ["/admin", "/admin/pedidos", "/admin/productos", "/admin/inventario"];
const TAB_LINKS = ADMIN_LINKS.filter((link) => TAB_HREFS.includes(link.href));
const MORE_LINKS = ADMIN_LINKS.filter((link) => !TAB_HREFS.includes(link.href));

const tabClass =
  "group flex flex-col items-center justify-center gap-1 text-[0.625rem] font-medium tracking-wide transition-colors duration-200 [-webkit-tap-highlight-color:transparent]";

function TabIcon({ icon, active }: { icon: string; active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-8 w-14 items-center justify-center rounded-full transition duration-200 group-active:scale-90",
        active ? "bg-inverse-foreground/10 text-inverse-accent" : "group-active:bg-inverse-border/60",
      )}
    >
      <span className="material-symbols-outlined text-[22px] leading-none" aria-hidden="true">
        {icon}
      </span>
    </span>
  );
}

export function AdminMobileNav({ userCard }: { userCard: React.ReactNode }) {
  const pathname = usePathname();
  // Guardar la ruta en la que se abrió (no un booleano) cierra el panel solo
  // al navegar, incluido el botón "atrás" del teléfono.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const close = () => setOpenAt(null);
  const moreActive = open || MORE_LINKS.some((link) => isActiveLink(pathname, link.href));

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
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center bg-inverse px-4 text-inverse-foreground [--logo-accent:var(--inverse-accent)] md:hidden">
        <Link href="/admin" aria-label="Panel admin" onClick={close}>
          <LogoHorizontal className="h-8 w-auto" title="" />
        </Link>
      </div>

      {open && (
        <div
          id="admin-more-panel"
          className="fixed inset-x-0 top-14 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 flex animate-fade-up flex-col gap-4 overflow-y-auto overscroll-contain border-t border-inverse-border bg-inverse px-3 py-4 md:hidden"
        >
          <span className="eyebrow px-3 text-[0.625rem] text-inverse-muted/70">Más secciones</span>
          <nav className="flex flex-col gap-1">
            <AdminNavLinks links={MORE_LINKS} onNavigate={close} />
          </nav>
          <div className="mt-auto">{userCard}</div>
        </div>
      )}

      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-inverse-border bg-inverse pb-[env(safe-area-inset-bottom)] text-inverse-foreground md:hidden"
      >
        <ul className="grid h-16 grid-cols-5">
          {TAB_LINKS.map((link) => {
            const active = !open && isActiveLink(pathname, link.href);
            return (
              <li key={link.href} className="flex">
                <Link
                  href={link.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    tabClass,
                    "flex-1",
                    active ? "text-inverse-foreground" : "text-inverse-muted",
                  )}
                >
                  <TabIcon icon={link.icon} active={active} />
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li className="flex">
            <button
              type="button"
              aria-expanded={open}
              aria-controls="admin-more-panel"
              onClick={() => setOpenAt(open ? null : pathname)}
              className={cn(
                tabClass,
                "flex-1",
                moreActive ? "text-inverse-foreground" : "text-inverse-muted",
              )}
            >
              <TabIcon icon={open ? "close" : "menu"} active={moreActive} />
              Más
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
