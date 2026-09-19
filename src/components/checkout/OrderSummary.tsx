import type { ComponentProps } from "react";
import { MapPin, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-foreground">Dirección de envío</h2>
        </div>
        <Card>
          <CardContent className="p-4">
            <AddressSummary address={address} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-foreground">Artículos</h2>
        </div>
        <Card>
          <CardContent className="p-4">
            <ul className="flex flex-col divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    {item.productName}
                    {item.variantSize ? (
                      <Badge variant="outline" className="text-xs">
                        {item.variantSize}
                      </Badge>
                    ) : null}
                    <span className="text-muted-foreground">× {item.quantity}</span>
                  </span>
                  <span className="text-muted-foreground">{formatCurrency(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <CartTotals subtotal={subtotal} shippingEstimate={shippingEstimate} />
      </div>
    </>
  );
}
