import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { DataTable } from "@/components/ui/DataTable";
import { AdminCardList, AdminListCard } from "@/components/admin/AdminListCard";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { listCategories } from "@/server/services/category-service";
import { ORDER_STATUS_LABELS } from "@/server/services/order-service";
import { PAYMENT_METHOD_OPTIONS } from "@/server/services/payment-service";
import {
  NO_CATEGORY,
  describeFilters,
  formatReportDay,
  getInventoryReport,
  getSalesReport,
  parseReportFilters,
  paymentMethodLabel,
  reportQueryString,
  toDayParam,
  type ReportFilters,
  type ReportType,
  type SalesReport,
} from "@/server/services/report-service";
import { cn, filterPillClass, formatCurrency, formatDate } from "@/lib/utils";
import { getAdminT, getLocale } from "@/lib/i18n";
import type { AdminT } from "@/lib/admin-i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getAdminT();
  return { title: t("Reportes") };
}

// En pantalla basta una muestra; el PDF siempre lleva el detalle completo.
const PREVIEW_ROWS = 25;

const REPORT_TYPES: { value: ReportType; label: string; text: string; icon: string }[] = [
  {
    value: "ventas",
    label: "Ventas",
    text: "Ingresos, pedidos, métodos de pago y productos más vendidos.",
    icon: "monitoring",
  },
  {
    value: "inventario",
    label: "Inventario",
    text: "Qué está disponible y qué está agotado, por producto y talla.",
    icon: "inventory",
  },
];

function quickRanges(now: Date) {
  const today = toDayParam(now);
  const daysAgo = (days: number) =>
    toDayParam(new Date(now.getTime() - days * 24 * 60 * 60 * 1000));
  return [
    { label: "Últimos 7 días", desde: daysAgo(6), hasta: today },
    { label: "Últimos 30 días", desde: daysAgo(29), hasta: today },
    { label: "Este mes", desde: `${today.slice(0, 7)}-01`, hasta: today },
    { label: "Este año", desde: `${today.slice(0, 4)}-01-01`, hasta: today },
  ];
}

function withChanges(filters: ReportFilters, changes: Partial<ReportFilters>) {
  return `/admin/reportes?${reportQueryString({ ...filters, ...changes })}`;
}

function Kpi({
  label,
  value,
  hint,
  featured,
}: {
  label: string;
  value: string;
  hint: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2 rounded-2xl border p-4 sm:p-5",
        featured
          ? "border-inverse bg-inverse text-inverse-foreground"
          : "border-border bg-background",
      )}
    >
      <span
        className={cn(
          "eyebrow text-[0.625rem]",
          featured ? "text-inverse-accent" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span className="text-[1.375rem] font-semibold tracking-tight tabular-nums sm:text-3xl">
        {value}
      </span>
      <span className={cn("text-xs", featured ? "text-inverse-muted" : "text-muted-foreground")}>
        {hint}
      </span>
    </div>
  );
}

type Bucket = SalesReport["summary"]["byMethod"][number];

// Barra proporcional al mayor monto del grupo: lectura rápida sin librería de
// gráficos.
function BreakdownCard({
  title,
  rows,
  countLabel,
  empty,
}: {
  title: string;
  rows: Bucket[];
  countLabel: string;
  empty: string;
}) {
  const max = Math.max(...rows.map((row) => row.amount), 0);
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-5">
      <h2 className="font-display text-xl text-foreground">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.key} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-foreground">{row.label}</span>
                <span className="shrink-0 font-medium tabular-nums text-foreground">
                  {formatCurrency(row.amount)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${max > 0 ? (row.amount / max) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                  {row.count} {countLabel}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AvailabilityBadge({ soldOut, t }: { soldOut: boolean; t: AdminT }) {
  return soldOut ? (
    <Badge variant="destructive">{t("Agotado")}</Badge>
  ) : (
    <Badge variant="secondary">{t("Disponible")}</Badge>
  );
}

export default async function AdminReportsPage({ searchParams }: PageProps<"/admin/reportes">) {
  const params = await searchParams;
  const now = new Date();
  const filters = parseReportFilters(params, now);
  const [t, locale, categories, sales, inventory] = await Promise.all([
    getAdminT(),
    getLocale(),
    listCategories(),
    filters.type === "ventas" ? getSalesReport(filters) : undefined,
    filters.type === "inventario" ? getInventoryReport(filters) : undefined,
  ]);
  const categoryName = categories.find((category) => category.id === filters.categoryId)?.label;
  const pdfHref = `/admin/reportes/pdf?${reportQueryString(filters)}`;
  const translateLabel = (row: Bucket) => ({ ...row, label: t(row.label) });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        eyebrow={t("Análisis")}
        title={t("Reportes")}
        description={t(
          "Filtra la información que necesitas y descárgala en PDF con el mismo detalle que ves aquí.",
        )}
        action={
          <a href={pdfHref} download>
            <Button>
              <Download className="h-4 w-4" aria-hidden="true" />
              {t("Descargar PDF")}
            </Button>
          </a>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {REPORT_TYPES.map((type) => {
          const active = type.value === filters.type;
          return (
            <Link
              key={type.value}
              href={withChanges(filters, { type: type.value })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group hover-lift flex flex-col items-start gap-3 rounded-2xl border p-4 sm:flex-row sm:gap-4 sm:p-5",
                active
                  ? "border-inverse bg-inverse text-inverse-foreground"
                  : "border-border bg-background hover:border-foreground/30",
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                  active
                    ? "bg-inverse-accent/15 text-inverse-accent"
                    : "bg-accent-soft text-accent",
                )}
              >
                <span
                  className="material-symbols-outlined text-[22px] leading-none"
                  aria-hidden="true"
                >
                  {type.icon}
                </span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-display text-xl">{t(type.label)}</span>
                <span
                  className={cn(
                    "hidden text-sm sm:block",
                    active ? "text-inverse-muted" : "text-muted-foreground",
                  )}
                >
                  {t(type.text)}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <form
        action="/admin/reportes"
        method="GET"
        className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-5 sm:p-6"
      >
        <input type="hidden" name="tipo" value={filters.type} />
        {/* El inventario es una foto de hoy: no usa período. */}
        {filters.type === "ventas" && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-sm font-medium text-foreground sm:mr-1">
              {t("Período rápido:")}
            </span>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
              {quickRanges(now).map((range) => {
                const active =
                  range.desde === toDayParam(filters.from) &&
                  range.hasta === toDayParam(filters.to);
                return (
                  <Link
                    key={range.label}
                    href={withChanges(filters, {
                      from: new Date(`${range.desde}T00:00:00.000Z`),
                      to: new Date(`${range.hasta}T00:00:00.000Z`),
                    })}
                    aria-current={active ? "true" : undefined}
                    className={cn(filterPillClass(active), "whitespace-nowrap")}
                  >
                    {t(range.label)}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filters.type === "ventas" ? (
            <>
              <TextField
                label={t("Desde")}
                name="desde"
                type="date"
                defaultValue={toDayParam(filters.from)}
              />
              <TextField
                label={t("Hasta")}
                name="hasta"
                type="date"
                defaultValue={toDayParam(filters.to)}
              />
              <SelectField label={t("Estado")} name="estado" defaultValue={filters.status ?? ""}>
                <option value="">{t("Todos")}</option>
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {t(label)}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label={t("Método de pago")}
                name="metodo"
                defaultValue={filters.paymentMethod ?? ""}
              >
                <option value="">{t("Todos")}</option>
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.label)}
                  </option>
                ))}
              </SelectField>
            </>
          ) : (
            <>
              <SelectField
                label={t("Categoría")}
                name="categoria"
                defaultValue={filters.categoryId ?? ""}
              >
                <option value="">{t("Todas")}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </SelectField>
              <div className="flex items-end sm:pb-3">
                <Checkbox
                  label={t("Solo agotados")}
                  name="agotados"
                  value="1"
                  defaultChecked={filters.soldOutOnly}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {describeFilters(filters, t, categoryName).map((label) => (
              <Badge key={label} variant="accent">
                {label}
              </Badge>
            ))}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Link href={`/admin/reportes?tipo=${filters.type}`}>
              <Button type="button" variant="ghost" className="w-full sm:w-auto">
                {t("Limpiar")}
              </Button>
            </Link>
            <Button type="submit" className="w-full sm:w-auto">
              {t("Aplicar filtros")}
            </Button>
          </div>
        </div>
      </form>

      {filters.type === "ventas" && (
        <p className="-mt-3 text-sm text-muted-foreground">
          {t("Período:")}{" "}
          <span className="font-medium text-foreground">
            {formatReportDay(filters.from, locale)}
          </span>{" "}
          –{" "}
          <span className="font-medium text-foreground">{formatReportDay(filters.to, locale)}</span>
        </p>
      )}

      {sales && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Kpi
              featured
              label={t("Ventas cobradas")}
              value={formatCurrency(sales.summary.paidRevenue)}
              hint={t("{count} pedidos confirmados o enviados", { count: sales.summary.paidCount })}
            />
            <Kpi
              label={t("Ticket promedio")}
              value={formatCurrency(sales.summary.averageTicket)}
              hint={t("Sobre ventas cobradas")}
            />
            <Kpi
              label={t("Pendiente de pago")}
              value={formatCurrency(sales.summary.pendingRevenue)}
              hint={t("Pedidos con pago pendiente")}
            />
            <Kpi
              label={t("Unidades vendidas")}
              value={String(sales.summary.unitsSold)}
              hint={t("{count} pedidos en el período", { count: sales.summary.orderCount })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BreakdownCard
              title={t("Pedidos por estado")}
              rows={sales.summary.byStatus.map(translateLabel)}
              countLabel={t("pedidos")}
              empty={t("Sin pedidos.")}
            />
            <BreakdownCard
              title={t("Métodos de pago")}
              rows={sales.summary.byMethod.map(translateLabel)}
              countLabel={t("pedidos")}
              empty={t("Sin ventas cobradas.")}
            />
            <BreakdownCard
              title={t("Productos más vendidos")}
              rows={sales.summary.topProducts}
              countLabel={t("unid.")}
              empty={t("Sin ventas cobradas.")}
            />
            <BreakdownCard
              title={t("Ventas por categoría")}
              rows={sales.summary.byCategory.map((row) =>
                row.label === NO_CATEGORY ? translateLabel(row) : row,
              )}
              countLabel={t("unid.")}
              empty={t("Sin ventas cobradas.")}
            />
          </div>

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-display text-2xl text-foreground">{t("Detalle de pedidos")}</h2>
              {sales.orders.length > PREVIEW_ROWS && (
                <span className="text-xs text-muted-foreground">
                  {t("Mostrando {shown} de {total} · el PDF incluye todos", {
                    shown: PREVIEW_ROWS,
                    total: sales.orders.length,
                  })}
                </span>
              )}
            </div>
            {sales.orders.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
                {t("No hay pedidos con estos filtros.")}
              </p>
            ) : (
              <>
                <AdminCardList>
                  {sales.orders.slice(0, PREVIEW_ROWS).map((order) => (
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
                      aside={<span className="tabular-nums">{formatCurrency(order.total)}</span>}
                    />
                  ))}
                </AdminCardList>
                <DataTable className="hidden md:block">
                  <thead>
                    <tr>
                      <th>{t("Fecha")}</th>
                      <th>{t("Cliente")}</th>
                      <th>{t("Método")}</th>
                      <th>{t("Estado")}</th>
                      <th className="text-right">{t("Total")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.orders.slice(0, PREVIEW_ROWS).map((order) => (
                      <tr key={order.id}>
                        <td className="text-muted-foreground">
                          {formatDate(order.createdAt, locale)}
                        </td>
                        <td>
                          <Link
                            href={`/admin/pedidos/${order.id}`}
                            className="font-medium text-foreground hover:text-accent"
                          >
                            {order.fullName}
                          </Link>
                        </td>
                        <td className="text-muted-foreground">
                          {t(paymentMethodLabel(order.paymentMethod))}
                        </td>
                        <td>
                          <OrderStatusBadge
                            status={order.status}
                            label={t(ORDER_STATUS_LABELS[order.status])}
                          />
                        </td>
                        <td className="text-right font-medium tabular-nums text-foreground">
                          {formatCurrency(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </>
            )}
          </section>
        </>
      )}

      {inventory && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            <Kpi
              featured
              label={t("Agotados")}
              value={String(inventory.summary.soldOut)}
              hint={t("No se pueden comprar")}
            />
            <Kpi
              label={t("Disponibles")}
              value={String(inventory.summary.available)}
              hint={t("A la venta")}
            />
            <Kpi
              label={t("Productos y tallas")}
              value={String(inventory.summary.rowCount)}
              hint={t("Con estos filtros")}
            />
          </div>

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-display text-2xl text-foreground">{t("Disponibilidad")}</h2>
              {inventory.rows.length > PREVIEW_ROWS && (
                <span className="text-xs text-muted-foreground">
                  {t("Mostrando {shown} de {total} · el PDF incluye todas", {
                    shown: PREVIEW_ROWS,
                    total: inventory.rows.length,
                  })}
                </span>
              )}
            </div>
            {inventory.rows.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
                {t("No hay productos con estos filtros.")}
              </p>
            ) : (
              <>
                <AdminCardList>
                  {inventory.rows.slice(0, PREVIEW_ROWS).map((row) => (
                    <AdminListCard
                      key={row.id}
                      href={`/admin/productos/${row.productId}/editar`}
                      title={row.product}
                      badge={<AvailabilityBadge soldOut={row.soldOut} t={t} />}
                      meta={[
                        row.category,
                        ...(row.size ? [t("Talla {size}", { size: row.size })] : []),
                        ...(row.active ? [] : [t("inactivo")]),
                      ].join(" · ")}
                    />
                  ))}
                </AdminCardList>
                <DataTable className="hidden md:block">
                  <thead>
                    <tr>
                      <th>{t("Producto")}</th>
                      <th>{t("Categoría")}</th>
                      <th>{t("Talla")}</th>
                      <th>{t("Estado")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.rows.slice(0, PREVIEW_ROWS).map((row) => (
                      <tr key={row.id}>
                        <td className="font-medium text-foreground">
                          <Link
                            href={`/admin/productos/${row.productId}/editar`}
                            className="hover:text-accent"
                          >
                            {row.product}
                          </Link>
                          {!row.active && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              ({t("inactivo")})
                            </span>
                          )}
                        </td>
                        <td className="text-muted-foreground">{row.category}</td>
                        <td className="text-muted-foreground">{row.size ?? "—"}</td>
                        <td>
                          <AvailabilityBadge soldOut={row.soldOut} t={t} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
