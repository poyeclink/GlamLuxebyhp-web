import { prisma } from "@/lib/prisma";
import type { OrderStatus, PaymentMethod, Prisma } from "@/generated/prisma/client";
import { ORDER_STATUS_LABELS } from "@/server/services/order-service";
import { PAYMENT_METHOD_OPTIONS, isPaymentMethod } from "@/server/services/payment-service";
import { sortVariantsBySize } from "@/server/services/product-service";
import { isUuid } from "@/lib/utils";
import { categoryLabel, productInCategory } from "@/server/services/category-service";
import type { AdminT } from "@/lib/admin-i18n";
import type { Locale } from "@/lib/i18n";

export type ReportType = "ventas" | "inventario";

export type ReportFilters = {
  type: ReportType;
  from: Date;
  to: Date;
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  categoryId?: string;
  soldOutOnly: boolean;
};

type SearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_RANGE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
// Estados que cuentan como venta cobrada; `reservado` todavía no está pagado
// y `cancelado`/`vencido` nunca lo estuvieron.
const PAID_STATUSES: OrderStatus[] = ["confirmado", "enviado"];

export const NO_CATEGORY = "Sin categoría";

export function paymentMethodLabel(method: PaymentMethod) {
  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method;
}

function single(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

// "YYYY-MM-DD" en UTC: el mismo día cubre de 00:00 a 23:59:59.999 sin
// depender de la zona horaria del servidor.
function parseDay(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Los rangos se arman en UTC (parseDay), así que se muestran en UTC: con la
// zona local del servidor el "desde" podía aparecer un día antes.
const dayFormatters: Record<Locale, Intl.DateTimeFormat> = {
  es: new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeZone: "UTC" }),
  en: new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }),
};

export function formatReportDay(date: Date, locale: Locale = "es") {
  return dayFormatters[locale].format(date);
}

export function toDayParam(date: Date) {
  return date.toISOString().slice(0, 10);
}

// Pura (sin DB): la página y la ruta del PDF la usan con los mismos
// searchParams, así el PDF siempre refleja exactamente lo que se ve en pantalla.
// Valores inválidos se ignoran (se tratan como "sin filtro"), nunca revientan.
export function parseReportFilters(params: SearchParams, now = new Date()): ReportFilters {
  const today = parseDay(toDayParam(now))!;
  let from =
    parseDay(single(params.desde)) ?? new Date(today.getTime() - (DEFAULT_RANGE_DAYS - 1) * DAY_MS);
  let to = parseDay(single(params.hasta)) ?? today;
  if (from > to) [from, to] = [to, from];

  const status = single(params.estado);
  const method = single(params.metodo);
  const categoryId = single(params.categoria);

  return {
    type: single(params.tipo) === "inventario" ? "inventario" : "ventas",
    from,
    to: new Date(to.getTime() + DAY_MS - 1),
    status:
      status && Object.hasOwn(ORDER_STATUS_LABELS, status) ? (status as OrderStatus) : undefined,
    paymentMethod: isPaymentMethod(method) ? method : undefined,
    categoryId: categoryId && isUuid(categoryId) ? categoryId : undefined,
    soldOutOnly: single(params.agotados) === "1",
  };
}

export function reportQueryString(filters: ReportFilters) {
  const params = new URLSearchParams({
    tipo: filters.type,
    desde: toDayParam(filters.from),
    hasta: toDayParam(filters.to),
  });
  if (filters.type === "ventas") {
    if (filters.status) params.set("estado", filters.status);
    if (filters.paymentMethod) params.set("metodo", filters.paymentMethod);
  } else {
    if (filters.categoryId) params.set("categoria", filters.categoryId);
    if (filters.soldOutOnly) params.set("agotados", "1");
  }
  return params.toString();
}

// Etiquetas legibles de los filtros activos (chips en pantalla y en el PDF).
export function describeFilters(filters: ReportFilters, t: AdminT, categoryName?: string) {
  const labels: string[] = [];
  if (filters.type === "ventas") {
    labels.push(
      filters.status
        ? t("Estado: {status}", { status: t(ORDER_STATUS_LABELS[filters.status]) })
        : t("Todos los estados"),
    );
    if (filters.paymentMethod)
      labels.push(t("Método: {method}", { method: t(paymentMethodLabel(filters.paymentMethod)) }));
  } else {
    labels.push(
      categoryName
        ? t("Categoría: {category}", { category: categoryName })
        : t("Todas las categorías"),
    );
    if (filters.soldOutOnly) labels.push(t("Solo agotados"));
  }
  return labels;
}

// ---------- Ventas ----------

type SalesOrderRow = {
  id: string;
  createdAt: Date;
  fullName: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  total: number;
  itemCount: number;
  items: { productName: string; category: string; quantity: number; lineTotal: number }[];
};

type Bucket = { key: string; label: string; count: number; amount: number };

function addToBucket(
  map: Map<string, Bucket>,
  key: string,
  label: string,
  amount: number,
  count = 1,
) {
  const bucket = map.get(key) ?? { key, label, count: 0, amount: 0 };
  bucket.count += count;
  bucket.amount += amount;
  map.set(key, bucket);
}

const byAmountDesc = (a: Bucket, b: Bucket) => b.amount - a.amount || b.count - a.count;

export function summarizeSales(orders: SalesOrderRow[]) {
  const paid = orders.filter((order) => PAID_STATUSES.includes(order.status));
  const sum = (rows: SalesOrderRow[]) => rows.reduce((total, order) => total + order.total, 0);

  const byStatus = new Map<string, Bucket>();
  for (const status of Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]) {
    byStatus.set(status, { key: status, label: ORDER_STATUS_LABELS[status], count: 0, amount: 0 });
  }
  for (const order of orders)
    addToBucket(byStatus, order.status, ORDER_STATUS_LABELS[order.status], order.total);

  // Métodos, productos y categorías solo sobre ventas cobradas: un
  // pedido vencido o cancelado no es una venta de ese producto.
  const byMethod = new Map<string, Bucket>();
  const byProduct = new Map<string, Bucket>();
  const byCategory = new Map<string, Bucket>();
  let unitsSold = 0;
  for (const order of paid) {
    addToBucket(
      byMethod,
      order.paymentMethod,
      paymentMethodLabel(order.paymentMethod),
      order.total,
    );
    for (const item of order.items) {
      unitsSold += item.quantity;
      addToBucket(byProduct, item.productName, item.productName, item.lineTotal, item.quantity);
      addToBucket(byCategory, item.category, item.category, item.lineTotal, item.quantity);
    }
  }

  const paidRevenue = sum(paid);
  return {
    orderCount: orders.length,
    paidCount: paid.length,
    paidRevenue,
    pendingRevenue: sum(orders.filter((order) => order.status === "reservado")),
    lostRevenue: sum(
      orders.filter((order) => order.status === "cancelado" || order.status === "vencido"),
    ),
    averageTicket: paid.length ? paidRevenue / paid.length : 0,
    unitsSold,
    byStatus: [...byStatus.values()],
    byMethod: [...byMethod.values()].sort(byAmountDesc),
    topProducts: [...byProduct.values()].sort(byAmountDesc).slice(0, 10),
    byCategory: [...byCategory.values()].sort(byAmountDesc),
  };
}

export async function getSalesReport(filters: ReportFilters) {
  const where: Prisma.OrderWhereInput = {
    createdAt: { gte: filters.from, lte: filters.to },
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.paymentMethod ? { paymentMethod: filters.paymentMethod } : {}),
  };
  const rows = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      fullName: true,
      status: true,
      paymentMethod: true,
      total: true,
      items: {
        select: {
          productName: true,
          quantity: true,
          unitPrice: true,
          product: {
            select: { category: { select: { name: true, parent: { select: { name: true } } } } },
          },
        },
      },
    },
  });

  const orders: SalesOrderRow[] = rows.map((order) => ({
    ...order,
    total: Number(order.total),
    itemCount: order.items.reduce((count, item) => count + item.quantity, 0),
    items: order.items.map((item) => ({
      productName: item.productName,
      // Producto borrado después de la venta (OrderItem.productId -> null).
      category: item.product ? categoryLabel(item.product.category) : NO_CATEGORY,
      quantity: item.quantity,
      lineTotal: Number(item.unitPrice) * item.quantity,
    })),
  }));

  return { orders, summary: summarizeSales(orders) };
}

export type SalesReport = Awaited<ReturnType<typeof getSalesReport>>;

// ---------- Inventario (disponibilidad) ----------

// Sin fechas: es una foto de lo que está Disponible o Agotado hoy. Un
// producto sin tallas es una sola fila; uno con tallas, una por talla.
export async function getInventoryReport(filters: ReportFilters) {
  const products = await prisma.product.findMany({
    where: filters.categoryId ? productInCategory({ id: filters.categoryId }) : {},
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      active: true,
      hasVariants: true,
      soldOut: true,
      category: { select: { name: true, parent: { select: { name: true } } } },
      variants: { select: { id: true, size: true, soldOut: true } },
    },
  });

  const rows = products
    .flatMap((product) => {
      const base = {
        productId: product.id,
        product: product.name,
        category: categoryLabel(product.category),
        active: product.active,
      };
      return product.hasVariants
        ? sortVariantsBySize(product.variants).map((variant) => ({
            ...base,
            id: variant.id,
            size: variant.size as string | null,
            soldOut: variant.soldOut,
          }))
        : [{ ...base, id: product.id, size: null, soldOut: product.soldOut }];
    })
    .filter((row) => !filters.soldOutOnly || row.soldOut)
    // Lo agotado primero: es lo que hay que revisar.
    .sort((a, b) => Number(b.soldOut) - Number(a.soldOut));

  const soldOut = rows.filter((row) => row.soldOut).length;
  return {
    rows,
    summary: { rowCount: rows.length, available: rows.length - soldOut, soldOut },
  };
}

export type InventoryReport = Awaited<ReturnType<typeof getInventoryReport>>;
