import Link from "next/link";
import { listVariantsWithStock, LOW_STOCK_THRESHOLD } from "@/server/services/inventory-service";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { ADMIN_PAGE_SIZE } from "@/lib/utils";

export default async function AdminInventoryPage({ searchParams }: PageProps<"/admin/inventario">) {
  const { q, page: pageParam } = await searchParams;
  const search = typeof q === "string" && q.trim() !== "" ? q.trim() : undefined;
  const page = Math.max(Number(typeof pageParam === "string" ? pageParam : "1") || 1, 1);

  const { items: variants, total } = await listVariantsWithStock({ search, page });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        eyebrow="Catálogo"
        title="Inventario"
        description={`Stock por talla, ordenado de menor a mayor. Stock bajo: ${LOW_STOCK_THRESHOLD} o menos.`}
      />

      <SearchInput
        action="/admin/inventario"
        placeholder="Buscar por producto..."
        defaultValue={search}
      />

      {variants.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
          {search
            ? `No encontramos productos para "${search}".`
            : "Todavía no hay tallas registradas."}
        </p>
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Talla</th>
              <th>Stock</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.id}>
                <td className="font-medium text-foreground">
                  {variant.product.name}
                  {!variant.product.active && (
                    <span className="ml-2 text-xs text-muted-foreground">(inactivo)</span>
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
                    Ver historial
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(target) =>
          `/admin/inventario?${search ? `q=${encodeURIComponent(search)}&` : ""}page=${target}`
        }
      />
    </div>
  );
}
