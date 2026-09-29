import Link from "next/link";
import { listOrdersForAdmin } from "@/server/services/order-service";
import { DataTable } from "@/components/ui/DataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { ADMIN_PAGE_SIZE, filterPillClass, formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

const STATUS_FILTERS: { value: OrderStatus; label: string }[] = [
  { value: "reservado", label: "Reservados" },
  { value: "confirmado", label: "Confirmados" },
  { value: "enviado", label: "Enviados" },
  { value: "cancelado", label: "Cancelados" },
  { value: "vencido", label: "Vencidos" },
];

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/pedidos">) {
  const { estado, q, page: pageParam } = await searchParams;
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
        eyebrow="Ventas"
        title="Pedidos"
        description={`${total} ${total === 1 ? "pedido" : "pedidos"} ${isFiltering ? "con este filtro" : "en total"}.`}
      />

      <div className="flex flex-col gap-4">
        <SearchInput
          action="/admin/pedidos"
          placeholder="Buscar por cliente..."
          defaultValue={search}
          hiddenParams={rawStatus ? { estado: rawStatus } : undefined}
        />

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/pedidos${searchQueryString ? `?${searchQueryString}` : ""}`}
            className={filterPillClass(!isFiltering)}
          >
            Todos
          </Link>
          {STATUS_FILTERS.map((option) => (
            <Link
              key={option.value}
              href={`/admin/pedidos?estado=${option.value}${searchQueryString ? `&${searchQueryString}` : ""}`}
              className={filterPillClass(statusFilter === option.value)}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
          {isFiltering && !matchedFilter
            ? "No reconocemos ese filtro de estado."
            : search
              ? `No encontramos pedidos para "${search}".`
              : "No hay pedidos con ese filtro."}
        </p>
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Método de pago</th>
              <th>Total</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="font-medium text-foreground">{order.fullName}</td>
                <td className="text-muted-foreground">{formatDate(order.createdAt)}</td>
                <td className="capitalize text-muted-foreground">{order.paymentMethod}</td>
                <td className="text-foreground">{formatCurrency(Number(order.total))}</td>
                <td>
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="text-right">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Ver detalle
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
          `/admin/pedidos?${rawStatus ? `estado=${rawStatus}&` : ""}${search ? `q=${encodeURIComponent(search)}&` : ""}page=${target}`
        }
      />
    </div>
  );
}
