import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { getAdminT, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import {
  describeFilters,
  getInventoryReport,
  getSalesReport,
  parseReportFilters,
  toDayParam,
} from "@/server/services/report-service";
import { ReportDocument } from "@/server/pdf/ReportDocument";
import { categoryLabel } from "@/server/services/category-service";

export async function GET(request: NextRequest) {
  // proxy.ts ya protege /admin/*, pero un Route Handler se revalida solo
  // (mismo criterio que requireAdmin() en los Server Actions).
  const [session, t, locale] = await Promise.all([getSession(), getAdminT(), getLocale()]);
  if (session?.role !== "administrador") {
    return new Response(t("No autorizado"), { status: 401 });
  }

  const filters = parseReportFilters(Object.fromEntries(request.nextUrl.searchParams));
  const [sales, inventory, category] = await Promise.all([
    filters.type === "ventas" ? getSalesReport(filters) : undefined,
    filters.type === "inventario" ? getInventoryReport(filters) : undefined,
    filters.categoryId
      ? prisma.category.findUnique({ where: { id: filters.categoryId }, select: { name: true, parent: { select: { name: true } } } })
      : null,
  ]);

  // ReportDocument devuelve un <Document>, pero su tipo de props no es
  // DocumentProps — renderToBuffer solo acepta ese tipo exacto.
  const document = createElement(ReportDocument, {
    filters,
    filterLabels: describeFilters(filters, t, category ? categoryLabel(category) : undefined),
    generatedBy: session.name,
    sales,
    inventory,
    t,
    locale,
  }) as unknown as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(document);

  // El inventario es una foto de hoy, sin período.
  const dates =
    filters.type === "ventas"
      ? `${toDayParam(filters.from)}_${toDayParam(filters.to)}`
      : toDayParam(new Date());
  const filename = `${t("reporte")}-${filters.type === "ventas" ? t("ventas") : t("inventario")}-${dates}.pdf`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
