import { formatCurrency } from "@/lib/utils";

export function CartTotals({
  subtotal,
  shippingEstimate,
}: {
  subtotal: number;
  shippingEstimate: number | null;
}) {
  return (
    <div className="flex flex-col gap-2 text-right">
      <div className="flex items-center justify-between gap-8 text-sm text-muted-foreground">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between gap-8 text-sm text-muted-foreground">
        <span>Envío estimado</span>
        <span>
          {shippingEstimate === null ? "Se coordina aparte" : formatCurrency(shippingEstimate)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-8 text-lg font-semibold text-foreground">
        <span>Total estimado</span>
        <span>{formatCurrency(subtotal + (shippingEstimate ?? 0))}</span>
      </div>
    </div>
  );
}
