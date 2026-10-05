import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AccountSection, AccountShell } from "@/components/account/AccountShell";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { requireCustomer } from "@/lib/session";
import { ORDER_STATUS_LABELS, listOrdersForCustomer } from "@/server/services/order-service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getLocale, t, tMany } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await t("Mis pedidos") };
}

export default async function OrderHistoryPage() {
  const session = await requireCustomer();
  const [orders, locale, copy, statusLabels] = await Promise.all([
    listOrdersForCustomer(session.userId),
    getLocale(),
    tMany({
      title: "Mis pedidos",
      emptyDescription: "Aquí verás el estado de cada compra.",
      countOne: "{count} pedido en tu historial.",
      countMany: "{count} pedidos en tu historial.",
      emptyTitle: "Todavía no has hecho ningún pedido",
      emptyText: "Explora la colección y arma tu primer pedido, al detalle o al por mayor.",
      cta: "Ir a la tienda",
      order: "Pedido #{id}",
      itemOne: "artículo",
      itemMany: "artículos",
    }),
    tMany(ORDER_STATUS_LABELS),
  ]);

  return (
    <AccountShell name={session.name} active="pedidos">
      <AccountSection
        icon={Package}
        title={copy.title}
        description={
          orders.length === 0
            ? copy.emptyDescription
            : (orders.length === 1 ? copy.countOne : copy.countMany).replace(
                "{count}",
                String(orders.length),
              )
        }
      >
        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-input px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Package className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="font-display text-2xl text-foreground">{copy.emptyTitle}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{copy.emptyText}</p>
            <Link href="/tienda" className="mt-2">
              <Button>
                {copy.cta}
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
                      {copy.order.replace("{id}", order.id.slice(0, 8))}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt, locale)} · {order._count.items}{" "}
                      {order._count.items === 1 ? copy.itemOne : copy.itemMany}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-6">
                    <OrderStatusBadge status={order.status} label={statusLabels[order.status]} />
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
