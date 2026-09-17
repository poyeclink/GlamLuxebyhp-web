import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type PriceDualProps = {
  wholesalePrice: number;
  individualPrice: number;
  className?: string;
};

export function PriceDual({ wholesalePrice, individualPrice, className }: PriceDualProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-foreground">
          {currencyFormatter.format(wholesalePrice)}
        </span>
        <Badge variant="secondary">Mayorista</Badge>
      </div>
      <span className="text-sm text-muted-foreground">
        Individual: {currencyFormatter.format(individualPrice)}
      </span>
    </div>
  );
}
