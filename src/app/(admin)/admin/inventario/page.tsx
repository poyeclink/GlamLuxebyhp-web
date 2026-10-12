import { listProductAvailability } from "@/server/services/inventory-service";
import { isProductSoldOut } from "@/server/services/product-service";
import {
  setProductSoldOutAction,
  setVariantSoldOutAction,
} from "@/server/actions/inventory-actions";
import { Badge } from "@/components/ui/Badge";
import { AdminCardList, AdminListCard } from "@/components/admin/AdminListCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AvailabilityToggle } from "@/components/admin/AvailabilityToggle";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { ADMIN_PAGE_SIZE } from "@/lib/utils";
import { getAdminT } from "@/lib/i18n";

export default async function AdminInventoryPage({ searchParams }: PageProps<"/admin/inventario">) {
  const { q, page: pageParam } = await searchParams;
  const search = typeof q === "string" && q.trim() !== "" ? q.trim() : undefined;
  const page = Math.max(Number(typeof pageParam === "string" ? pageParam : "1") || 1, 1);

  const [{ items: products, total }, t] = await Promise.all([
    listProductAvailability({ search, page }),
    getAdminT(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        eyebrow={t("Catálogo")}
        title={t("Inventario")}
        description={t(
          "Toca un producto o una talla para marcarlo Disponible o Agotado. Lo agotado se sigue viendo en la tienda, pero no se puede comprar.",
        )}
      />

      <SearchInput
        action="/admin/inventario"
        placeholder={t("Buscar por producto...")}
        defaultValue={search}
      />

      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
          {search
            ? t('No encontramos productos para "{search}".', { search })
            : t("Todavía no hay productos.")}
        </p>
      ) : (
        <AdminCardList className="md:grid md:grid-cols-2 md:gap-4">
          {products.map((product) => (
            <AdminListCard
              key={product.id}
              href={`/admin/productos/${product.id}/editar`}
              title={product.name}
              badge={
                isProductSoldOut(product) ? (
                  <Badge variant="destructive">{t("Agotado")}</Badge>
                ) : null
              }
              meta={[
                product.hasVariants
                  ? t("{count} tallas", { count: product.variants.length })
                  : t("Sin tallas"),
                ...(product.active ? [] : [t("inactivo")]),
              ].join(" · ")}
              actions={
                <div className="flex w-full flex-wrap gap-2">
                  {product.hasVariants ? (
                    product.variants.length === 0 ? (
                      <span className="text-sm text-muted-foreground">
                        {t("Sin tallas cargadas.")}
                      </span>
                    ) : (
                      product.variants.map((variant) => (
                        <AvailabilityToggle
                          key={variant.id}
                          size={variant.size}
                          soldOut={variant.soldOut}
                          action={setVariantSoldOutAction.bind(null, variant.id, !variant.soldOut)}
                        />
                      ))
                    )
                  ) : (
                    <AvailabilityToggle
                      soldOut={product.soldOut}
                      action={setProductSoldOutAction.bind(null, product.id, !product.soldOut)}
                    />
                  )}
                </div>
              }
            />
          ))}
        </AdminCardList>
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
