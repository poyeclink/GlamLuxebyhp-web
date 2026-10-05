import { formatCurrency } from "@/lib/utils";
import { computeCartTotal } from "@/server/services/cart-service";

export const CART_TOTALS_COPY = {
  subtotal: "Subtotal",
  shipping: "Envío estimado",
  shippingSeparate: "Se coordina aparte",
  total: "Total estimado",
};

export function CartTotals({
  subtotal,
  shippingEstimate,
  copy = CART_TOTALS_COPY,
}: {
  subtotal: number;
  shippingEstimate: number | null;
  copy?: typeof CART_TOTALS_COPY;
}) {
  return (
    <div className="flex flex-col gap-2 text-right">
      <div className="flex items-center justify-between gap-8 text-sm text-muted-foreground">
        <span>{copy.subtotal}</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between gap-8 text-sm text-muted-foreground">
        <span>{copy.shipping}</span>
        <span>
          {shippingEstimate === null ? copy.shippingSeparate : formatCurrency(shippingEstimate)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-8 text-lg font-semibold text-foreground">
        <span>{copy.total}</span>
        <span>{formatCurrency(computeCartTotal(subtotal, shippingEstimate))}</span>
      </div>
    </div>
  );
}
