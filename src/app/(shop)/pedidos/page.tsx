import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AccountSection, AccountShell } from "@/components/account/AccountShell";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { requireCustomer } from "@/lib/session";
import { listOrdersForCustomer } from "@/server/services/order-service";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Mis pedidos" };

export default async function OrderHistoryPage() {
  const session = await requireCustomer();
  const orders = await listOrdersForCustomer(session.userId);

  return (
    <AccountShell name={session.name} active="pedidos">
      <AccountSection
        icon={Package}
        title="Mis pedidos"
        description={
          orders.length === 0
            ? "Aquí verás el estado de cada compra."
            : `${orders.length} ${orders.length === 1 ? "pedido" : "pedidos"} en tu historial.`
        }
      >
        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-input px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Package className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="font-display text-2xl text-foreground">
              Todavía no has hecho ningún pedido
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Explora la colección y arma tu primer pedido, al detalle o al por mayor.
            </p>
            <Link href="/tienda" className="mt-2">
              <Button>
                Ir a la tienda
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col overflow-hidden rounded-2xl border border-border">
            {orders.map((order) => (
              <li key={order.id} className="border-t border-border first:border-t-0">
                <Link
                  href={`/pedidos/${order.id}`}
                  className="group flex items-center gap-4 bg-background px-5 py-4 transition-colors duration-300 hover:bg-accent-soft/50 sm:px-6"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-inverse text-inverse-accent">
                    <Package className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-display text-lg text-foreground">
                      Pedido #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)} · {order._count.items}{" "}
                      {order._count.items === 1 ? "artículo" : "artículos"}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-6">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-sm font-medium text-foreground sm:w-24 sm:text-right">
                      {formatCurrency(Number(order.total))}
                    </span>
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AccountSection>
    </AccountShell>
  );
}
