import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { requireCustomer } from "@/lib/session";
import { ORDER_STATUS_BADGE_VARIANT, listOrdersForCustomer } from "@/server/services/order-service";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function OrderHistoryPage() {
  const session = await requireCustomer();
  const orders = await listOrdersForCustomer(session.userId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Mis pedidos</h1>
        <p className="text-muted-foreground">Historial de todos tus pedidos.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <Package className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Todavía no has hecho ningún pedido.</p>
            <Link href="/tienda">
              <Button size="sm">Ir a la tienda</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/pedidos/${order.id}`}>
              <Card className="transition-colors hover:border-foreground">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Package className="h-5 w-5 text-secondary-foreground" aria-hidden="true" />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      Pedido #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)} · {order._count.items}{" "}
                      {order._count.items === 1 ? "artículo" : "artículos"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>{order.status}</Badge>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(Number(order.total))}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
