import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { requireCustomer } from "@/lib/session";
import { getOrderForCustomer, getOrderStatusMessage } from "@/server/services/order-service";
import { formatDate } from "@/lib/utils";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCustomer();
  const { id } = await params;
  const order = await getOrderForCustomer(session.userId, id);
  if (!order) notFound();

  const { title, description } = getOrderStatusMessage(order.status, order.paymentMethod);

  return (
    <AccountShell name={session.name} active="pedidos">
      <div className="flex flex-col gap-8">
        <Link
          href="/pedidos"
          className="group flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Mis pedidos
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">
              Pedido #{order.id.slice(0, 8)}
            </h2>
            <p className="text-sm text-muted-foreground">
              Realizado el {formatDate(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-8">
            <OrderSummary
              address={{
                fullName: order.fullName,
                addressLine: order.addressLine,
                city: order.city,
                state: order.state,
                zip: order.zip,
                addressType: order.addressType,
                whatsapp: order.whatsapp,
              }}
              items={order.items.map((item) => ({
                id: item.id,
                productName: item.productName,
                variantSize: item.variantSize,
                quantity: item.quantity,
                lineTotal: Number(item.unitPrice) * item.quantity,
              }))}
              subtotal={Number(order.subtotal)}
              shippingEstimate={order.shippingCost === null ? null : Number(order.shippingCost)}
            />
          </div>

          <div className="flex flex-col gap-4 rounded-2xl bg-inverse p-6 text-inverse-foreground lg:sticky lg:top-28">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-inverse-accent/15 text-inverse-accent">
              <Info className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="font-display text-xl">{title}</p>
            <p className="text-sm leading-relaxed text-inverse-muted">{description}</p>
          </div>
        </div>
      </div>
    </AccountShell>
  );
}
