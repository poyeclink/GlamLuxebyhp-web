import Link from "next/link";
import { ORDER_STATUS_BADGE_VARIANT, listOrdersForAdmin } from "@/server/services/order-service";
import { Badge } from "@/components/ui/Badge";
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

export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin/pedidos">) {
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
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Pedidos</h1>

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

      {orders.length === 0 ? (
        <p className="text-muted-foreground">
          {isFiltering && !matchedFilter
            ? "No reconocemos ese filtro de estado."
            : search
              ? `No encontramos pedidos para "${search}".`
              : "No hay pedidos con ese filtro."}
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 font-medium">Cliente</th>
              <th className="py-2 font-medium">Fecha</th>
              <th className="py-2 font-medium">Método de pago</th>
              <th className="py-2 font-medium">Total</th>
              <th className="py-2 font-medium">Estado</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border">
                <td className="py-3 text-foreground">{order.fullName}</td>
                <td className="py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                <td className="py-3 text-muted-foreground">{order.paymentMethod}</td>
                <td className="py-3 text-foreground">{formatCurrency(Number(order.total))}</td>
                <td className="py-3">
                  <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>{order.status}</Badge>
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="text-sm font-medium text-foreground hover:underline"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
