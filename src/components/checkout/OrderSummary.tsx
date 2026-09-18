import type { ComponentProps } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { AddressSummary } from "@/components/account/AddressSummary";
import { CartTotals } from "@/components/shop/CartTotals";
import { formatCurrency } from "@/lib/utils";

export function OrderSummary({
  address,
  items,
  subtotal,
  shippingEstimate,
}: {
  address: ComponentProps<typeof AddressSummary>["address"];
  items: { id: string; productName: string; variantSize: string | null; quantity: number; lineTotal: number }[];
  subtotal: number;
  shippingEstimate: number | null;
}) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Dirección de envío</h2>
        <Card>
          <CardContent className="p-4">
            <AddressSummary address={address} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Artículos</h2>
        <ul className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="text-foreground">
                {item.productName}
                {item.variantSize ? ` (${item.variantSize})` : ""} × {item.quantity}
              </span>
              <span className="text-muted-foreground">{formatCurrency(item.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <CartTotals subtotal={subtotal} shippingEstimate={shippingEstimate} />
      </div>
    </>
  );
}
