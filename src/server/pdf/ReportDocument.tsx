import fs from "node:fs";
import path from "node:path";
import { Document, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { InventoryReport, ReportFilters, SalesReport } from "@/server/services/report-service";
import { NO_CATEGORY, TIER_LABELS, formatReportDay, paymentMethodLabel } from "@/server/services/report-service";
import { ORDER_STATUS_LABELS } from "@/server/services/order-service";
import { LOW_STOCK_THRESHOLD } from "@/server/services/inventory-service";
import { SITE_NAME } from "@/lib/site";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminT } from "@/lib/admin-i18n";
import type { Locale } from "@/lib/i18n";

// El PDF no ve las variables CSS del sitio: la paleta de marca va literal,
// igual que en la imagen OG (pieza de marca fija, ver CLAUDE.md).
const BRAND = {
  ink: "#0A0A0B",
  zafiro: "#1B6FB8",
  hielo: "#5CB8F0",
  bruma: "#EAF6FD",
  muted: "#5B6470",
  border: "#E4E8EE",
  soft: "#F4F6F8",
  white: "#FFFFFF",
  danger: "#C62828",
};

// Mismos trazos que el logo horizontal del sitio (versión sobre negro); se lee
// del SVG público para no duplicar los paths. next.config.ts lo incluye en el
// bundle de esta ruta (outputFileTracingIncludes).
const LOGO_PATHS = [
  ...fs
    .readFileSync(path.join(process.cwd(), "public/brand/glamluxe-horizontal-color-oscuro.svg"), "utf8")
    .matchAll(/<path ([^>]+)\/>/g),
].map(([, attrs]) => Object.fromEntries([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v])));

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: BRAND.ink,
  },
  header: {
    backgroundColor: BRAND.ink,
    borderRadius: 10,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: { alignItems: "flex-end", gap: 3 },
  eyebrow: { fontSize: 7, letterSpacing: 2, textTransform: "uppercase", color: BRAND.hielo },
  title: { fontFamily: "Times-Roman", fontSize: 22, color: BRAND.white },
  headerMeta: { fontSize: 8, color: "#9AA3AE" },
  filters: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    backgroundColor: BRAND.bruma,
    color: BRAND.zafiro,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 7.5,
  },
  kpis: { marginTop: 16, flexDirection: "row", gap: 8 },
  kpi: { flex: 1, borderWidth: 1, borderColor: BRAND.border, borderRadius: 8, padding: 10, gap: 4 },
  kpiFeatured: { backgroundColor: BRAND.ink, borderColor: BRAND.ink },
  kpiLabel: { fontSize: 7, letterSpacing: 1, textTransform: "uppercase", color: BRAND.muted },
  kpiValue: { fontSize: 15, fontFamily: "Helvetica-Bold" },
  kpiHint: { fontSize: 7, color: BRAND.muted },
  section: { marginTop: 20 },
  sectionTitle: { fontFamily: "Times-Roman", fontSize: 14, marginBottom: 8 },
  columns: { flexDirection: "row", gap: 12 },
  column: { flex: 1 },
  table: { borderWidth: 1, borderColor: BRAND.border, borderRadius: 6 },
  thead: {
    flexDirection: "row",
    backgroundColor: BRAND.soft,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  th: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontSize: 6.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: BRAND.muted,
    fontFamily: "Helvetica-Bold",
  },
  row: { flexDirection: "row", borderTopWidth: 1, borderTopColor: BRAND.border },
  td: { paddingVertical: 5, paddingHorizontal: 6, fontSize: 8 },
  right: { textAlign: "right" },
  empty: { padding: 12, color: BRAND.muted, fontSize: 8 },
  note: { marginTop: 6, fontSize: 7, color: BRAND.muted },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: BRAND.muted,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingTop: 8,
  },
});

type Column<T> = {
  label: string;
  width: string;
  align?: "right";
  render: (row: T) => string;
  color?: (row: T) => string | undefined;
};

function Table<T>({ columns, rows, empty }: { columns: Column<T>[]; rows: T[]; empty: string }) {
  return (
    <View style={styles.table}>
      <View style={styles.thead}>
        {columns.map((column) => (
          <Text
            key={column.label}
            style={[
              styles.th,
              { width: column.width },
              column.align === "right" ? styles.right : {},
            ]}
          >
            {column.label}
          </Text>
        ))}
      </View>
      {rows.length === 0 ? (
        <Text style={styles.empty}>{empty}</Text>
      ) : (
        rows.map((row, index) => (
          <View
            key={index}
            style={[styles.row, index % 2 === 1 ? { backgroundColor: "#FAFBFC" } : {}]}
            wrap={false}
          >
            {columns.map((column) => (
              <Text
                key={column.label}
                style={[
                  styles.td,
                  { width: column.width },
                  column.align === "right" ? styles.right : {},
                  column.color?.(row) ? { color: column.color(row) } : {},
                ]}
              >
                {column.render(row)}
              </Text>
            ))}
          </View>
        ))
      )}
    </View>
  );
}

function Kpi({
  label,
  value,
  hint,
  featured,
}: {
  label: string;
  value: string;
  hint?: string;
  featured?: boolean;
}) {
  return (
    <View style={[styles.kpi, featured ? styles.kpiFeatured : {}]}>
      <Text style={[styles.kpiLabel, featured ? { color: BRAND.hielo } : {}]}>{label}</Text>
      <Text style={[styles.kpiValue, featured ? { color: BRAND.white } : {}]}>{value}</Text>
      {hint && <Text style={[styles.kpiHint, featured ? { color: "#9AA3AE" } : {}]}>{hint}</Text>}
    </View>
  );
}

type Bucket = SalesReport["summary"]["byMethod"][number];

const bucketColumns = (
  t: AdminT,
  first: string,
  countLabel = t("Pedidos"),
  label: (row: Bucket) => string = (row) => t(row.label),
): Column<Bucket>[] => [
  { label: first, width: "50%", render: label },
  { label: countLabel, width: "20%", align: "right", render: (row) => String(row.count) },
  { label: t("Monto"), width: "30%", align: "right", render: (row) => formatCurrency(row.amount) },
];

type BodyProps<R> = { report: R; t: AdminT; locale: Locale };

function SalesBody({ report, t, locale }: BodyProps<SalesReport>) {
  const { summary, orders } = report;
  return (
    <>
      <View style={styles.kpis}>
        <Kpi
          featured
          label={t("Ventas cobradas")}
          value={formatCurrency(summary.paidRevenue)}
          hint={t("{count} pedidos confirmados/enviados", { count: summary.paidCount })}
        />
        <Kpi
          label={t("Ticket promedio")}
          value={formatCurrency(summary.averageTicket)}
          hint={t("Sobre ventas cobradas")}
        />
        <Kpi
          label={t("Pendiente de pago")}
          value={formatCurrency(summary.pendingRevenue)}
          hint={t("Pedidos con pago pendiente")}
        />
        <Kpi
          label={t("Unidades vendidas")}
          value={String(summary.unitsSold)}
          hint={t("{count} pedidos en el período", { count: summary.orderCount })}
        />
      </View>

      <View style={styles.section} wrap={false}>
        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{t("Pedidos por estado")}</Text>
            <Table
              columns={bucketColumns(t, t("Estado"))}
              rows={summary.byStatus}
              empty={t("Sin pedidos.")}
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{t("Métodos de pago")}</Text>
            <Table
              columns={bucketColumns(t, t("Método"))}
              rows={summary.byMethod}
              empty={t("Sin ventas cobradas.")}
            />
          </View>
        </View>
      </View>

      <View style={styles.section} wrap={false}>
        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{t("Productos más vendidos")}</Text>
            <Table
              columns={bucketColumns(t, t("Producto"), t("Unidades"), (row) => row.label)}
              rows={summary.topProducts}
              empty={t("Sin ventas cobradas.")}
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{t("Ventas por categoría")}</Text>
            <Table
              columns={bucketColumns(t, t("Categoría"), t("Unidades"), (row) =>
                row.label === NO_CATEGORY ? t(row.label) : row.label,
              )}
              rows={summary.byCategory}
              empty={t("Sin ventas cobradas.")}
            />
            <Text style={[styles.sectionTitle, { marginTop: 14 }]}>{t("Tipo de precio")}</Text>
            <Table
              columns={bucketColumns(t, t("Tipo"))}
              rows={summary.byTier}
              empty={t("Sin ventas cobradas.")}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("Detalle de pedidos")}</Text>
        <Table
          columns={[
            { label: t("Fecha"), width: "12%", render: (row) => formatDate(row.createdAt, locale) },
            { label: t("Pedido"), width: "11%", render: (row) => `#${row.id.slice(0, 8)}` },
            { label: t("Cliente"), width: "23%", render: (row) => row.fullName },
            {
              label: t("Método"),
              width: "11%",
              render: (row) => t(paymentMethodLabel(row.paymentMethod)),
            },
            { label: t("Tipo"), width: "11%", render: (row) => t(TIER_LABELS[row.pricingTier]) },
            {
              label: t("Estado"),
              width: "12%",
              render: (row) => t(ORDER_STATUS_LABELS[row.status]),
              color: (row) =>
                row.status === "cancelado" || row.status === "vencido"
                  ? BRAND.danger
                  : row.status === "reservado"
                    ? BRAND.zafiro
                    : undefined,
            },
            { label: t("Art."), width: "7%", align: "right", render: (row) => String(row.itemCount) },
            {
              label: t("Total"),
              width: "13%",
              align: "right",
              render: (row) => formatCurrency(row.total),
            },
          ]}
          rows={orders}
          empty={t("No hay pedidos con estos filtros.")}
        />
        <Text style={styles.note}>
          {t(
            "Ventas cobradas = pedidos confirmados o enviados. En pedidos mayoristas el total no incluye envío (se coordina aparte).",
          )}
        </Text>
      </View>
    </>
  );
}

function InventoryBody({ report, t }: BodyProps<InventoryReport>) {
  const { summary, rows } = report;
  return (
    <>
      <View style={styles.kpis}>
        <Kpi
          featured
          label={t("Valor del inventario")}
          value={formatCurrency(summary.value)}
          hint={t("A precio mayorista")}
        />
        <Kpi
          label={t("Unidades en stock")}
          value={String(summary.units)}
          hint={t("{count} tallas", { count: summary.variantCount })}
        />
        <Kpi
          label={t("Stock bajo")}
          value={String(summary.lowStock)}
          hint={t("{threshold} o menos unidades", { threshold: LOW_STOCK_THRESHOLD })}
        />
        <Kpi
          label={t("Agotadas")}
          value={String(summary.outOfStock)}
          hint={t("Sin unidades")}
        />
      </View>

      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>{t("Movimientos en el período")}</Text>
        <Table
          columns={[
            { label: t("Tipo de movimiento"), width: "50%", render: (row) => t(row.label) },
            {
              label: t("Registros"),
              width: "20%",
              align: "right",
              render: (row) => String(row.count),
            },
            {
              label: t("Unidades"),
              width: "30%",
              align: "right",
              render: (row) => (row.units > 0 ? `+${row.units}` : String(row.units)),
            },
          ]}
          rows={summary.movements}
          empty={t("Sin movimientos.")}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("Stock por talla")}</Text>
        <Table
          columns={[
            {
              label: t("Producto"),
              width: "34%",
              render: (row) => (row.active ? row.product : `${row.product} (${t("inactivo")})`),
            },
            { label: t("Categoría"), width: "20%", render: (row) => row.category },
            { label: t("Talla"), width: "10%", render: (row) => row.size },
            {
              label: t("Estado"),
              width: "12%",
              render: (row) =>
                t(row.stock === 0 ? "Agotado" : row.stock <= LOW_STOCK_THRESHOLD ? "Bajo" : "OK"),
              color: (row) =>
                row.stock === 0
                  ? BRAND.danger
                  : row.stock <= LOW_STOCK_THRESHOLD
                    ? BRAND.zafiro
                    : undefined,
            },
            { label: t("Stock"), width: "10%", align: "right", render: (row) => String(row.stock) },
            {
              label: t("Valor"),
              width: "14%",
              align: "right",
              render: (row) => formatCurrency(row.value),
            },
          ]}
          rows={rows}
          empty={t("No hay tallas con estos filtros.")}
        />
        <Text style={styles.note}>
          {t(
            "Solo productos con tallas llevan control de stock. El valor usa el precio mayorista actual.",
          )}
        </Text>
      </View>
    </>
  );
}

export function ReportDocument({
  filters,
  filterLabels,
  generatedBy,
  sales,
  inventory,
  t,
  locale,
}: {
  filters: ReportFilters;
  filterLabels: string[];
  generatedBy: string;
  sales?: SalesReport;
  inventory?: InventoryReport;
  t: AdminT;
  locale: Locale;
}) {
  const title = t(filters.type === "ventas" ? "Reporte de ventas" : "Reporte de inventario");
  const period = `${formatReportDay(filters.from, locale)} – ${formatReportDay(filters.to, locale)}`;

  return (
    <Document
      title={`${title} · ${SITE_NAME}`}
      author={SITE_NAME}
      creator={SITE_NAME}
      language={locale}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Svg viewBox="-3 11 664 170" style={{ width: 160, height: 41 }}>
            {LOGO_PATHS.map((segment, index) => (
              <Path
                key={index}
                d={segment.d}
                fill={segment.fill ?? "none"}
                stroke={segment.stroke}
                strokeWidth={segment["stroke-width"]}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </Svg>
          <View style={styles.headerRight}>
            <Text style={styles.eyebrow}>{t("Panel administrativo")}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.headerMeta}>{t("Período: {period}", { period })}</Text>
            <Text style={styles.headerMeta}>
              {t("Generado el {date} por {name}", {
                date: formatDate(new Date(), locale),
                name: generatedBy,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.filters}>
          {filterLabels.map((label) => (
            <Text key={label} style={styles.chip}>
              {label}
            </Text>
          ))}
        </View>

        {sales && <SalesBody report={sales} t={t} locale={locale} />}
        {inventory && <InventoryBody report={inventory} t={t} locale={locale} />}

        <View style={styles.footer} fixed>
          <Text>
            {SITE_NAME} · {t("Documento interno, uso confidencial")}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              t("Página {page} de {totalPages}", { page: pageNumber, totalPages })
            }
          />
        </View>
      </Page>
    </Document>
  );
}
