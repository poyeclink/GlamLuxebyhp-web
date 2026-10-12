import Link from "next/link";
import { listVariantsWithStock, LOW_STOCK_THRESHOLD } from "@/server/services/inventory-service";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { AdminCardList, AdminListCard } from "@/components/admin/AdminListCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { ADMIN_PAGE_SIZE } from "@/lib/utils";
import { getAdminT } from "@/lib/i18n";

export default async function AdminInventoryPage({ searchParams }: PageProps<"/admin/inventario">) {
  const { q, page: pageParam } = await searchParams;
  const search = typeof q === "string" && q.trim() !== "" ? q.trim() : undefined;
  const page = Math.max(Number(typeof pageParam === "string" ? pageParam : "1") || 1, 1);

  const [{ items: variants, total }, t] = await Promise.all([
    listVariantsWithStock({ search, page }),
    getAdminT(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        eyebrow={t("Catálogo")}
        title={t("Inventario")}
        description={t("Stock por talla, ordenado de menor a mayor. Stock bajo: {threshold} o menos.", {
          threshold: LOW_STOCK_THRESHOLD,
        })}
      />

      <SearchInput
        action="/admin/inventario"
        placeholder={t("Buscar por producto...")}
        defaultValue={search}
      />

      {variants.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
          {search
            ? t('No encontramos productos para "{search}".', { search })
            : t("Todavía no hay tallas registradas.")}
        </p>
      ) : (
        <>
          <AdminCardList>
            {variants.map((variant) => (
              <AdminListCard
                key={variant.id}
                href={`/admin/inventario/${variant.id}`}
                title={variant.product.name}
                badge={
                  <Badge
                    variant={variant.stock <= LOW_STOCK_THRESHOLD ? "destructive" : "secondary"}
                  >
                    {variant.stock === 0 ? t("Agotado") : t("{count} unid.", { count: variant.stock })}
                  </Badge>
                }
                meta={`${t("Talla {size}", { size: variant.size })}${variant.product.active ? "" : ` · ${t("inactivo")}`}`}
              />
            ))}
          </AdminCardList>
          <DataTable className="hidden md:block">
            <thead>
              <tr>
                <th>{t("Producto")}</th>
                <th>{t("Talla")}</th>
                <th>{t("Stock")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id}>
                  <td className="font-medium text-foreground">
                    {variant.product.name}
                    {!variant.product.active && (
                      <span className="ml-2 text-xs text-muted-foreground">({t("inactivo")})</span>
                    )}
                  </td>
                  <td className="text-muted-foreground">{variant.size}</td>
                  <td>
                    <Badge
                      variant={variant.stock <= LOW_STOCK_THRESHOLD ? "destructive" : "secondary"}
                    >
                      {variant.stock}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/admin/inventario/${variant.id}`}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      {t("Ver historial")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </>
      )}

      <Pagination
        t={t}
        page={page}
        totalPages={totalPages}
        buildHref={(target) =>
          `/admin/inventario?${search ? `q=${encodeURIComponent(search)}&` : ""}page=${target}`
        }
      />
    </div>
  );
}
