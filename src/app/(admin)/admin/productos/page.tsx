import Image from "next/image";
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
import { AdminCardList, AdminListCard } from "@/components/admin/AdminListCard";
import { Isotipo } from "@/components/brand/Logo";
import { r2PublicUrl } from "@/lib/r2";
import { ADMIN_PAGE_SIZE, formatCurrency } from "@/lib/utils";
import { getAdminT } from "@/lib/i18n";
import type { AdminT } from "@/lib/admin-i18n";

function StatusBadge({ active, t }: { active: boolean; t: AdminT }) {
  return active ? (
    <Badge variant="accent">{t("Activo")}</Badge>
  ) : (
    <Badge variant="outline">{t("Inactivo")}</Badge>
  );
}

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/productos">) {
  const { q, page: pageParam } = await searchParams;
  const t = await getAdminT();
  const search = typeof q === "string" && q.trim() !== "" ? q.trim() : undefined;
  const page = Math.max(Number(typeof pageParam === "string" ? pageParam : "1") || 1, 1);

  const { items: products, total } = await listProducts({ search, page });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        eyebrow={t("Catálogo")}
        title={t("Productos")}
        description={
          total === 1
            ? t("1 producto en el catálogo.")
            : t("{count} productos en el catálogo.", { count: total })
        }
        action={
          <Link href="/admin/productos/nuevo">
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("Nuevo producto")}
            </Button>
          </Link>
        }
      />

      <SearchInput
        action="/admin/productos"
        placeholder={t("Buscar por nombre...")}
        defaultValue={search}
      />

      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
          {search
            ? t('No encontramos productos para "{search}".', { search })
            : t("Todavía no hay productos.")}
        </p>
      ) : (
        <>
          <AdminCardList>
            {products.map((product) => {
              const editHref = `/admin/productos/${product.id}/editar`;
              const image = product.images[0];
              return (
                <AdminListCard
                  key={product.id}
                  href={editHref}
                  title={product.name}
                  badge={<StatusBadge active={product.active} t={t} />}
                  meta={categoryLabel(product.category)}
                  aside={
                    <div className="flex flex-col items-end leading-tight">
                      <span>{formatCurrency(Number(product.individualPrice))}</span>
                      <span className="text-xs font-normal text-accent">
                        {t("{price} mayorista", { price: formatCurrency(Number(product.wholesalePrice)) })}
                      </span>
                    </div>
                  }
                  media={
                    <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {image ? (
                        <Image
                          src={r2PublicUrl(image.key)}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <Isotipo
                          className="h-auto w-8 text-muted-foreground/40 [--logo-accent:currentColor]"
                          title=""
                        />
                      )}
                    </div>
                  }
                  actions={
                    <>
                      <Link href={editHref}>
                        <Button variant="outline" size="sm">
                          {t("Editar")}
                        </Button>
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </>
                  }
                />
              );
            })}
          </AdminCardList>
          <DataTable className="hidden md:block">
            <thead>
              <tr>
                <th>{t("Nombre")}</th>
                <th>{t("Categoría")}</th>
                <th>{t("Mayorista")}</th>
                <th>{t("Estado")}</th>
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
                    <StatusBadge active={product.active} t={t} />
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/productos/${product.id}/editar`}>
                        <Button variant="outline" size="sm">
                          {t("Editar")}
                        </Button>
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </div>
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
          `/admin/productos?${search ? `q=${encodeURIComponent(search)}&` : ""}page=${target}`
        }
      />
    </div>
  );
}
