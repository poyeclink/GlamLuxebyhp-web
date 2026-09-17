import { Badge } from "@/components/ui/Badge";
import { cn, formatCurrency } from "@/lib/utils";

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
          {formatCurrency(wholesalePrice)}
        </span>
        <Badge variant="secondary">Mayorista</Badge>
      </div>
      <span className="text-sm text-muted-foreground">
        Individual: {formatCurrency(individualPrice)}
      </span>
    </div>
  );
}
