import { Badge } from "@/components/ui/Badge";
import { cn, formatCurrency } from "@/lib/utils";
import { t } from "@/lib/i18n";

type PriceDualProps = {
  wholesalePrice: number;
  individualPrice: number;
  className?: string;
};

export async function PriceDual({ wholesalePrice, individualPrice, className }: PriceDualProps) {
  const [wholesaleLabel, individualLabel] = await Promise.all([t("Mayorista"), t("Individual")]);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-foreground">
          {formatCurrency(wholesalePrice)}
        </span>
        <Badge variant="secondary">{wholesaleLabel}</Badge>
      </div>
      <span className="text-sm text-muted-foreground">
        {individualLabel}: {formatCurrency(individualPrice)}
      </span>
    </div>
  );
}
