import Link from "next/link";
import { Plus } from "lucide-react";
import { listProducts } from "@/server/services/product-service";
import { categoryLabel } from "@/server/services/category-service";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { ADMIN_PAGE_SIZE, formatCurrency } from "@/lib/utils";

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/productos">) {
  const { q, page: pageParam } = await searchParams;
  const search = typeof q === "string" && q.trim() !== "" ? q.trim() : undefined;
  const page = Math.max(Number(typeof pageParam === "string" ? pageParam : "1") || 1, 1);

  const { items: products, total } = await listProducts({ search, page });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        eyebrow="Catálogo"
        title="Productos"
        description={`${total} ${total === 1 ? "producto" : "productos"} en el catálogo.`}
        action={
          <Link href="/admin/productos/nuevo">
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo producto
            </Button>
          </Link>
        }
      />

      <SearchInput
        action="/admin/productos"
        placeholder="Buscar por nombre..."
        defaultValue={search}
      />

      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
          {search ? `No encontramos productos para "${search}".` : "Todavía no hay productos."}
        </p>
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Mayorista</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="font-medium text-foreground">{product.name}</td>
                <td className="text-muted-foreground">{categoryLabel(product.category)}</td>
                <td className="text-muted-foreground">
                  {formatCurrency(Number(product.wholesalePrice))}
                </td>
                <td>
                  {product.active ? (
                    <Badge variant="accent">Activo</Badge>
                  ) : (
                    <Badge variant="outline">Inactivo</Badge>
                  )}
                </td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/productos/${product.id}/editar`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <DeleteProductButton productId={product.id} />
                  </div>
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
          `/admin/productos?${search ? `q=${encodeURIComponent(search)}&` : ""}page=${target}`
        }
      />
    </div>
  );
}
