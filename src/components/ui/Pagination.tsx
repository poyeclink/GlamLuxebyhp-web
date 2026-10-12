import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdminT } from "@/lib/admin-i18n";

function PageButton({ href, children }: { href: string | null; children: React.ReactNode }) {
  const button = (
    <Button variant="outline" size="sm" disabled={!href} className="min-w-10 gap-1 px-3">
      {children}
    </Button>
  );
  return href ? <Link href={href}>{button}</Link> : button;
}

export function Pagination({
  page,
  totalPages,
  buildHref,
  t,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  t: AdminT;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t("Paginación")}
      className="flex items-center justify-between gap-2 border-t border-border pt-4 sm:justify-end"
    >
      <PageButton href={page > 1 ? buildHref(page - 1) : null}>
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        {t("Anterior")}
      </PageButton>
      <span className="text-sm tabular-nums text-muted-foreground sm:order-first sm:mr-auto">
        <span className="sm:hidden">
          {page} / {totalPages}
        </span>
        <span className="hidden sm:inline">
          {t("Página {page} de {totalPages}", { page, totalPages })}
        </span>
      </span>
      <PageButton href={page < totalPages ? buildHref(page + 1) : null}>
        {t("Siguiente")}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </PageButton>
    </nav>
  );
}
