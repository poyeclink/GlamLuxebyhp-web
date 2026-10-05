import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Versión móvil de una fila de DataTable: en el teléfono las tablas obligaban a
// deslizar de lado y el estado/total quedaban fuera de pantalla. Cada listado
// del admin renderiza `<AdminCardList>` con `md:hidden` y su tabla con
// `hidden md:block`. Con `href` la tarjeta entera es tocable; con `actions`
// (Editar/Eliminar) los botones van en su propia fila, fuera del enlace.
export function AdminCardList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <ul className={cn("flex flex-col gap-3 md:hidden", className)}>{children}</ul>;
}

export function AdminListCard({
  href,
  title,
  badge,
  meta,
  aside,
  media,
  actions,
}: {
  href?: string;
  title: React.ReactNode;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
  aside?: React.ReactNode;
  media?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const body = (
    <div className="flex items-center gap-3 p-4">
      {media && <div className="shrink-0">{media}</div>}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 font-medium leading-snug text-foreground">{title}</p>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
        {(meta || aside) && (
          <div className="flex items-end justify-between gap-3 text-sm">
            <div className="min-w-0 text-muted-foreground">{meta}</div>
            {aside && <div className="shrink-0 font-medium text-foreground">{aside}</div>}
          </div>
        )}
      </div>
      {href && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
    </div>
  );

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-background">
      {href ? (
        <Link href={href} className="block transition-colors active:bg-accent-soft/60">
          {body}
        </Link>
      ) : (
        body
      )}
      {actions && (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/40 px-4 py-2.5">
          {actions}
        </div>
      )}
    </li>
  );
}
