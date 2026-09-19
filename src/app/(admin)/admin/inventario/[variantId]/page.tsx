import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getVariantForAdjustment,
  listInventoryLogsForVariant,
} from "@/server/services/inventory-service";
import { AdjustStockForm } from "@/components/admin/AdjustStockForm";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { InventoryLogReason } from "@/generated/prisma/client";

const REASON_LABELS: Record<InventoryLogReason, string> = {
  reserva: "Reserva (pedido)",
  venta: "Venta confirmada",
  liberacion: "Liberación de stock",
  ajuste_manual: "Ajuste manual",
};

export default async function AdminInventoryVariantPage({
  params,
}: PageProps<"/admin/inventario/[variantId]">) {
  const { variantId } = await params;
  const variant = await getVariantForAdjustment(variantId);
  if (!variant) notFound();

  const logs = await listInventoryLogsForVariant(variantId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-16">
      <Link href="/admin/inventario" className="text-sm text-muted-foreground hover:text-foreground">
        ← Volver a inventario
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">{variant.product.name}</h1>
        <p className="text-sm text-muted-foreground">Talla {variant.size}</p>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <span className="text-sm text-muted-foreground">Stock actual</span>
          <span className="text-2xl font-semibold text-foreground">{variant.stock}</span>
        </CardContent>
      </Card>

      {/* Solo lectura, a propósito primero en la página — es lo que "Ver
          historial" (link de origen en /admin/inventario) promete mostrar.
          El ajuste manual (la única acción que de verdad cambia el stock)
          vive aparte, más abajo y marcado como tal, para que no se confunda
          con este registro informativo. */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Historial de movimientos</h2>
        <p className="text-sm text-muted-foreground">
          Registro de solo lectura: reservas, liberaciones y ajustes manuales de esta talla.
        </p>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay movimientos registrados.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {logs.map((log) => (
              <li key={log.id} className="flex flex-col gap-1 py-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <Badge variant={log.quantityChange < 0 ? "destructive" : "secondary"}>
                    {REASON_LABELS[log.reason]}
                  </Badge>
                  <span className="text-foreground">
                    {log.quantityChange > 0 ? "+" : ""}
                    {log.quantityChange} → stock {log.stockAfter}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                  <span>
                    {formatDate(log.createdAt)}
                    {log.admin ? ` · ${log.admin.name}` : ""}
                    {log.order ? ` · pedido ${log.order.id.slice(0, 8)}` : ""}
                  </span>
                </div>
                {log.note && <p className="text-xs text-muted-foreground">{log.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Card className="border-destructive/40">
        <CardHeader className="gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-destructive" aria-hidden="true">
              warning
            </span>
            <CardTitle className="text-base">Ajustar stock manualmente</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Esto cambia el inventario real de inmediato, no es una simulación. Un número negativo
            resta stock, uno positivo lo suma.
          </p>
        </CardHeader>
        <CardContent>
          <AdjustStockForm variantId={variant.id} />
        </CardContent>
      </Card>
    </div>
  );
}
