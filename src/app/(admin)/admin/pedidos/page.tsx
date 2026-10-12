import Link from "next/link";
import { ORDER_STATUS_LABELS, listOrdersForAdmin } from "@/server/services/order-service";
import { DataTable } from "@/components/ui/DataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCardList, AdminListCard } from "@/components/admin/AdminListCard";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { paymentMethodLabel } from "@/server/services/report-service";
import { ADMIN_PAGE_SIZE, filterPillClass, formatCurrency, formatDate } from "@/lib/utils";
import { getAdminT, getLocale } from "@/lib/i18n";
import type { OrderStatus } from "@/generated/prisma/client";

const STATUS_FILTERS: { value: OrderStatus; label: string }[] = [
  { value: "reservado", label: "Pago pendiente" },
  { value: "confirmado", label: "Confirmados" },
  { value: "enviado", label: "Enviados" },
  { value: "cancelado", label: "Cancelados" },
  { value: "vencido", label: "Sin pagar" },
];

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/pedidos">) {
  const { estado, q, page: pageParam } = await searchParams;
  const [t, locale] = await Promise.all([getAdminT(), getLocale()]);
  // typeof === "string": searchParams puede traer un array (?estado=a&estado=b);
  // mismo cuidado que TiendaPage con `categoria`.
  const rawStatus = typeof estado === "string" ? estado : undefined;
  const matchedFilter = STATUS_FILTERS.find((option) => option.value === rawStatus);
  // Un filtro presente pero irreconocible NO es "sin filtro": mismo criterio
  // que /tienda?categoria= con un slug inválido (CLAUDE.md, ticket #16) — no
  // se debe resaltar "Todos" como si el usuario lo hubiera elegido.
  const isFiltering = Boolean(rawStatus);
  const statusFilter = matchedFilter?.value;
  const search = typeof q === "string" && q.trim() !== "" ? q.trim() : undefined;
  const page = Math.max(Number(typeof pageParam === "string" ? pageParam : "1") || 1, 1);

  const { items: orders, total } =
    isFiltering && !matchedFilter
      ? { items: [], total: 0 }
      : await listOrdersForAdmin({ status: statusFilter, search, page });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  // Los links de estado deben conservar la búsqueda activa; el form de
  // búsqueda conserva el estado activo vía hiddenParams — ninguno de los dos
  // debe pisar al otro, y ambos omiten `page` para volver a la página 1.
  const searchQueryString = search ? `q=${encodeURIComponent(search)}` : "";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        eyebrow={t("Ventas")}
        title={t("Pedidos")}
        description={
          isFiltering
            ? total === 1
              ? t("1 pedido con este filtro.")
              : t("{count} pedidos con este filtro.", { count: total })
            : total === 1
              ? t("1 pedido en total.")
              : t("{count} pedidos en total.", { count: total })
        }
      />

      <div className="flex flex-col gap-4">
        <SearchInput
          action="/admin/pedidos"
          placeholder={t("Buscar por cliente...")}
          defaultValue={search}
          hiddenParams={rawStatus ? { estado: rawStatus } : undefined}
        />

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden">
          <Link
            href={`/admin/pedidos${searchQueryString ? `?${searchQueryString}` : ""}`}
            className={filterPillClass(!isFiltering)}
          >
            {t("Todos")}
          </Link>
          {STATUS_FILTERS.map((option) => (
            <Link
              key={option.value}
              href={`/admin/pedidos?estado=${option.value}${searchQueryString ? `&${searchQueryString}` : ""}`}
              className={filterPillClass(statusFilter === option.value)}
            >
              {t(option.label)}
            </Link>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
          {isFiltering && !matchedFilter
            ? t("No reconocemos ese filtro de estado.")
            : search
              ? t('No encontramos pedidos para "{search}".', { search })
              : t("No hay pedidos con ese filtro.")}
        </p>
      ) : (
        <>
          <AdminCardList>
            {orders.map((order) => (
              <AdminListCard
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                title={order.fullName}
                badge={
                  <OrderStatusBadge
                    status={order.status}
                    label={t(ORDER_STATUS_LABELS[order.status])}
                  />
                }
                meta={`${formatDate(order.createdAt, locale)} · ${t(paymentMethodLabel(order.paymentMethod))}`}
                aside={formatCurrency(Number(order.total))}
              />
            ))}
          </AdminCardList>
          <DataTable className="hidden md:block">
            <thead>
              <tr>
                <th>{t("Cliente")}</th>
                <th>{t("Fecha")}</th>
                <th>{t("Método de pago")}</th>
                <th>{t("Total")}</th>
                <th>{t("Estado")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium text-foreground">{order.fullName}</td>
                  <td className="text-muted-foreground">{formatDate(order.createdAt, locale)}</td>
                  <td className="text-muted-foreground">
                    {t(paymentMethodLabel(order.paymentMethod))}
                  </td>
                  <td className="text-foreground">{formatCurrency(Number(order.total))}</td>
                  <td>
                    <OrderStatusBadge
                      status={order.status}
                      label={t(ORDER_STATUS_LABELS[order.status])}
                    />
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      {t("Ver detalle")}
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
          `/admin/pedidos?${rawStatus ? `estado=${rawStatus}&` : ""}${search ? `q=${encodeURIComponent(search)}&` : ""}page=${target}`
        }
      />
    </div>
  );
}
