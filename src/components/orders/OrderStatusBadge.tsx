import { Badge } from "@/components/ui/Badge";
import { ORDER_STATUS_BADGE_VARIANT, ORDER_STATUS_LABELS } from "@/server/services/order-service";
import type { OrderStatus } from "@/generated/prisma/client";

export function OrderStatusBadge({ status, label }: { status: OrderStatus; label?: string }) {
  return (
    <Badge variant={ORDER_STATUS_BADGE_VARIANT[status]} className="gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label ?? ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
