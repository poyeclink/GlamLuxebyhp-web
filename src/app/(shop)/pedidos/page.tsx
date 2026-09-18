import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
        <p className="text-sm text-muted-foreground">Todavía no has hecho ningún pedido.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/pedidos/${order.id}`}>
              <Card className="transition-colors hover:border-foreground">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      Pedido del {formatDate(order.createdAt)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(Number(order.total))}
                    </span>
                  </div>
                  <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>{order.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
