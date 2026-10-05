import type { ComponentProps } from "react";
import { MapPin, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ADDRESS_SUMMARY_COPY, AddressSummary } from "@/components/account/AddressSummary";
import { CART_TOTALS_COPY, CartTotals } from "@/components/shop/CartTotals";
import { formatCurrency } from "@/lib/utils";

export const ORDER_SUMMARY_COPY = {
  shippingAddress: "Dirección de envío",
  items: "Artículos",
  ...ADDRESS_SUMMARY_COPY,
  ...CART_TOTALS_COPY,
};

export function OrderSummary({
  address,
  items,
  subtotal,
  shippingEstimate,
  copy = ORDER_SUMMARY_COPY,
}: {
  address: ComponentProps<typeof AddressSummary>["address"];
  items: {
    id: string;
    productName: string;
    variantSize: string | null;
    quantity: number;
    lineTotal: number;
  }[];
  subtotal: number;
  shippingEstimate: number | null;
  copy?: typeof ORDER_SUMMARY_COPY;
}) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-display text-xl text-foreground">{copy.shippingAddress}</h2>
        </div>
        <Card>
          <CardContent className="p-4">
            <AddressSummary address={address} copy={copy} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-display text-xl text-foreground">{copy.items}</h2>
        </div>
        <Card>
          <CardContent className="p-4">
            <ul className="flex flex-col divide-y divide-border">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-1.5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <span className="min-w-0 text-foreground">{item.productName}</span>
                  <span className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                    {item.variantSize ? (
                      <Badge variant="outline" className="text-xs">
                        {item.variantSize}
                      </Badge>
                    ) : null}
                    <span className="text-muted-foreground">× {item.quantity}</span>
                    <span className="ml-auto pl-2 text-muted-foreground sm:ml-0">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <CartTotals subtotal={subtotal} shippingEstimate={shippingEstimate} copy={copy} />
      </div>
    </>
  );
}
