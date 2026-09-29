"use client";

import { useId, useState } from "react";
import { Check, Truck } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export type ShippingTierRate = { minQuantity: number; maxQuantity: number | null; price: number };

export type TierSimulatorCopy = {
  itemsLabel: string;
  individual: string;
  wholesale: string;
  shipping: string;
  shippingCoordinated: string;
  // "{count}" se reemplaza en el cliente: una función no cruza la frontera Server→Client.
  remaining: string;
  unlocked: string;
};

const MAX_ITEMS = 12;

// Misma regla que el carrito (WHOLESALE_ITEM_THRESHOLD + ShippingRate del
// tier individual), recibida como props: aquí solo se ilustra, nunca se cobra.
export function TierSimulator({
  threshold,
  individualRates,
  copy,
}: {
  threshold: number;
  individualRates: ShippingTierRate[];
  copy: TierSimulatorCopy;
}) {
  const [items, setItems] = useState(3);
  const inputId = useId();
  const isWholesale = items >= threshold;
  const rate = individualRates.find(
    (r) => r.minQuantity <= items && (r.maxQuantity === null || r.maxQuantity >= items),
  );
  const percent = Math.min(100, (items / threshold) * 100);

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-inverse-border bg-inverse-foreground/[0.03] p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={inputId} className="text-sm font-medium text-inverse-foreground">
          {copy.itemsLabel}
        </label>
        <span className="font-display text-4xl text-inverse-foreground tabular-nums">{items}</span>
      </div>
      <input
        id={inputId}
        type="range"
        min={1}
        max={MAX_ITEMS}
        value={items}
        onChange={(event) => setItems(Number(event.target.value))}
        className="w-full accent-[var(--inverse-accent)]"
      />

      <div className="grid grid-cols-2 gap-3">
        {[
          { active: !isWholesale, label: copy.individual },
          { active: isWholesale, label: copy.wholesale },
        ].map((tier) => (
          <div
            key={tier.label}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors duration-300",
              tier.active
                ? "border-inverse-accent bg-inverse-accent/10 text-inverse-foreground"
                : "border-inverse-border text-inverse-muted",
            )}
          >
            <Check className={cn("h-4 w-4 text-inverse-accent transition-opacity", tier.active ? "opacity-100" : "opacity-0")} />
            {tier.label}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-inverse-border">
          <div className="h-full rounded-full bg-inverse-accent transition-[width] duration-300" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-sm text-inverse-muted" aria-live="polite">
          {isWholesale ? copy.unlocked : copy.remaining.replace("{count}", String(threshold - items))}
        </p>
      </div>

      <div className="flex items-center gap-3 border-t border-inverse-border pt-5 text-sm text-inverse-foreground">
        <Truck className="h-5 w-5 text-inverse-accent" aria-hidden="true" />
        <span>
          {copy.shipping}:{" "}
          <strong className="font-semibold">
            {!isWholesale && rate ? formatCurrency(rate.price) : copy.shippingCoordinated}
          </strong>
        </span>
      </div>
    </div>
  );
}
