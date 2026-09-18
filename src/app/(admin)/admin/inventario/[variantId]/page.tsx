import { notFound } from "next/navigation";
import {
  getVariantForAdjustment,
  listInventoryLogsForVariant,
} from "@/server/services/inventory-service";
import { AdjustStockForm } from "@/components/admin/AdjustStockForm";
import { Badge } from "@/components/ui/Badge";
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
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">{variant.product.name}</h1>
        <p className="text-sm text-muted-foreground">
          Talla {variant.size} · Stock actual: <span className="font-medium">{variant.stock}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Ajuste manual</h2>
        <AdjustStockForm variantId={variant.id} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Historial de movimientos</h2>
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
    </div>
  );
}
