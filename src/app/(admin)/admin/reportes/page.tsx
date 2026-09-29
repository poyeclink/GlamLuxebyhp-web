import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { DataTable } from "@/components/ui/DataTable";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { listCategories } from "@/server/services/category-service";
import { LOW_STOCK_THRESHOLD } from "@/server/services/inventory-service";
import { ORDER_STATUS_LABELS } from "@/server/services/order-service";
import { PAYMENT_METHOD_OPTIONS } from "@/server/services/payment-service";
import {
  TIER_LABELS,
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
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Reportes" };

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
    text: "Stock por talla, valor del inventario y movimientos.",
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
        "flex flex-col gap-2 rounded-2xl border p-5",
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
      <span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
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
                <span className="truncate text-foreground">{row.label}</span>
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

export default async function AdminReportsPage({ searchParams }: PageProps<"/admin/reportes">) {
  const params = await searchParams;
  const now = new Date();
  const filters = parseReportFilters(params, now);
  const [categories, sales, inventory] = await Promise.all([
    listCategories(),
    filters.type === "ventas" ? getSalesReport(filters) : undefined,
    filters.type === "inventario" ? getInventoryReport(filters) : undefined,
  ]);
  const categoryName = categories.find((category) => category.id === filters.categoryId)?.name;
  const pdfHref = `/admin/reportes/pdf?${reportQueryString(filters)}`;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        eyebrow="Análisis"
        title="Reportes"
        description="Filtra la información que necesitas y descárgala en PDF con el mismo detalle que ves aquí."
        action={
          <a href={pdfHref} download>
            <Button>
              <Download className="h-4 w-4" aria-hidden="true" />
              Descargar PDF
            </Button>
          </a>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {REPORT_TYPES.map((type) => {
          const active = type.value === filters.type;
          return (
            <Link
              key={type.value}
              href={withChanges(filters, { type: type.value })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group hover-lift flex items-start gap-4 rounded-2xl border p-5",
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
                <span className="font-display text-xl">{type.label}</span>
                <span
                  className={cn("text-sm", active ? "text-inverse-muted" : "text-muted-foreground")}
                >
                  {type.text}
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-medium text-foreground">Período rápido:</span>
          {quickRanges(now).map((range) => {
            const active =
              range.desde === toDayParam(filters.from) && range.hasta === toDayParam(filters.to);
            return (
              <Link
                key={range.label}
                href={withChanges(filters, {
                  from: new Date(`${range.desde}T00:00:00.000Z`),
                  to: new Date(`${range.hasta}T00:00:00.000Z`),
                })}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {range.label}
              </Link>
            );
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TextField
            label="Desde"
            name="desde"
            type="date"
            defaultValue={toDayParam(filters.from)}
          />
          <TextField label="Hasta" name="hasta" type="date" defaultValue={toDayParam(filters.to)} />
          {filters.type === "ventas" ? (
            <>
              <SelectField label="Estado" name="estado" defaultValue={filters.status ?? ""}>
                <option value="">Todos</option>
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Método de pago"
                name="metodo"
                defaultValue={filters.paymentMethod ?? ""}
              >
                <option value="">Todos</option>
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
              <SelectField label="Tipo de precio" name="tier" defaultValue={filters.tier ?? ""}>
                <option value="">Todos</option>
                {Object.entries(TIER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </SelectField>
            </>
          ) : (
            <>
              <SelectField
                label="Categoría"
                name="categoria"
                defaultValue={filters.categoryId ?? ""}
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </SelectField>
              <div className="flex items-end pb-3">
                <Checkbox
                  label={`Solo stock bajo (${LOW_STOCK_THRESHOLD} o menos)`}
                  name="stockBajo"
                  value="1"
                  defaultChecked={filters.lowStockOnly}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {describeFilters(filters, categoryName).map((label) => (
              <Badge key={label} variant="accent">
                {label}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/reportes?tipo=${filters.type}`}>
              <Button type="button" variant="ghost">
                Limpiar
              </Button>
            </Link>
            <Button type="submit">Aplicar filtros</Button>
          </div>
        </div>
      </form>

      <p className="-mt-3 text-sm text-muted-foreground">
        Período:{" "}
        <span className="font-medium text-foreground">{formatReportDay(filters.from)}</span> –{" "}
        <span className="font-medium text-foreground">{formatReportDay(filters.to)}</span>
      </p>

      {sales && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi
              featured
              label="Ventas cobradas"
              value={formatCurrency(sales.summary.paidRevenue)}
              hint={`${sales.summary.paidCount} pedidos confirmados o enviados`}
            />
            <Kpi
              label="Ticket promedio"
              value={formatCurrency(sales.summary.averageTicket)}
              hint="Sobre ventas cobradas"
            />
            <Kpi
              label="Pendiente de pago"
              value={formatCurrency(sales.summary.pendingRevenue)}
              hint="Pedidos reservados"
            />
            <Kpi
              label="Unidades vendidas"
              value={String(sales.summary.unitsSold)}
              hint={`${sales.summary.orderCount} pedidos en el período`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <BreakdownCard
              title="Pedidos por estado"
              rows={sales.summary.byStatus}
              countLabel="pedidos"
              empty="Sin pedidos."
            />
            <BreakdownCard
              title="Métodos de pago"
              rows={sales.summary.byMethod}
              countLabel="pedidos"
              empty="Sin ventas cobradas."
            />
            <BreakdownCard
              title="Productos más vendidos"
              rows={sales.summary.topProducts}
              countLabel="unid."
              empty="Sin ventas cobradas."
            />
            <BreakdownCard
              title="Ventas por categoría"
              rows={sales.summary.byCategory}
              countLabel="unid."
              empty="Sin ventas cobradas."
            />
          </div>

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-display text-2xl text-foreground">Detalle de pedidos</h2>
              {sales.orders.length > PREVIEW_ROWS && (
                <span className="text-xs text-muted-foreground">
                  Mostrando {PREVIEW_ROWS} de {sales.orders.length} · el PDF incluye todos
                </span>
              )}
            </div>
            {sales.orders.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
                No hay pedidos con estos filtros.
              </p>
            ) : (
              <DataTable>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Método</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.orders.slice(0, PREVIEW_ROWS).map((order) => (
                    <tr key={order.id}>
                      <td className="text-muted-foreground">{formatDate(order.createdAt)}</td>
                      <td>
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="font-medium text-foreground hover:text-accent"
                        >
                          {order.fullName}
                        </Link>
                      </td>
                      <td className="text-muted-foreground">
                        {paymentMethodLabel(order.paymentMethod)}
                      </td>
                      <td className="text-muted-foreground">{TIER_LABELS[order.pricingTier]}</td>
                      <td>
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="text-right font-medium tabular-nums text-foreground">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            )}
          </section>
        </>
      )}

      {inventory && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi
              featured
              label="Valor del inventario"
              value={formatCurrency(inventory.summary.value)}
              hint="A precio mayorista"
            />
            <Kpi
              label="Unidades en stock"
              value={String(inventory.summary.units)}
              hint={`${inventory.summary.variantCount} tallas`}
            />
            <Kpi
              label="Stock bajo"
              value={String(inventory.summary.lowStock)}
              hint={`${LOW_STOCK_THRESHOLD} o menos unidades`}
            />
            <Kpi
              label="Agotadas"
              value={String(inventory.summary.outOfStock)}
              hint="Sin unidades"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {inventory.summary.movements.map((movement) => (
              <div
                key={movement.reason}
                className="flex flex-col gap-1 rounded-2xl border border-border bg-background p-5"
              >
                <span className="text-sm text-muted-foreground">{movement.label}</span>
                <span className="text-2xl font-semibold tabular-nums text-foreground">
                  {movement.units > 0 ? `+${movement.units}` : movement.units}
                </span>
                <span className="text-xs text-muted-foreground">
                  {movement.count} {movement.count === 1 ? "registro" : "registros"} en el período
                </span>
              </div>
            ))}
          </div>

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-display text-2xl text-foreground">Stock por talla</h2>
              {inventory.rows.length > PREVIEW_ROWS && (
                <span className="text-xs text-muted-foreground">
                  Mostrando {PREVIEW_ROWS} de {inventory.rows.length} · el PDF incluye todas
                </span>
              )}
            </div>
            {inventory.rows.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
                No hay tallas con estos filtros.
              </p>
            ) : (
              <DataTable>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Talla</th>
                    <th>Estado</th>
                    <th className="text-right">Stock</th>
                    <th className="text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.rows.slice(0, PREVIEW_ROWS).map((row) => (
                    <tr key={row.id}>
                      <td className="font-medium text-foreground">
                        <Link href={`/admin/inventario/${row.id}`} className="hover:text-accent">
                          {row.product}
                        </Link>
                        {!row.active && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            (inactivo)
                          </span>
                        )}
                      </td>
                      <td className="text-muted-foreground">{row.category}</td>
                      <td className="text-muted-foreground">{row.size}</td>
                      <td>
                        {row.stock === 0 ? (
                          <Badge variant="destructive">Agotado</Badge>
                        ) : row.stock <= LOW_STOCK_THRESHOLD ? (
                          <Badge variant="accent">Bajo</Badge>
                        ) : (
                          <Badge variant="secondary">OK</Badge>
                        )}
                      </td>
                      <td className="text-right tabular-nums text-foreground">{row.stock}</td>
                      <td className="text-right tabular-nums text-foreground">
                        {formatCurrency(row.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            )}
          </section>
        </>
      )}
    </div>
  );
}
