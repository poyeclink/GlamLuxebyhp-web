import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { ORDER_SUMMARY_COPY, OrderSummary } from "@/components/checkout/OrderSummary";
import { requireCustomer } from "@/lib/session";
import {
  ORDER_STATUS_LABELS,
  getOrderForCustomer,
  getOrderStatusMessage,
} from "@/server/services/order-service";
import { formatDate } from "@/lib/utils";
import { getLocale, t, tMany } from "@/lib/i18n";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCustomer();
  const { id } = await params;
  const order = await getOrderForCustomer(session.userId, id);
  if (!order) notFound();

  const [locale, copy, summaryCopy, statusLabel, message, items] = await Promise.all([
    getLocale(),
    tMany({ back: "Mis pedidos", order: "Pedido #{id}", placedOn: "Realizado el {date}" }),
    tMany(ORDER_SUMMARY_COPY),
    t(ORDER_STATUS_LABELS[order.status]),
    tMany(getOrderStatusMessage(order.status, order.paymentMethod)),
    Promise.all(
      order.items.map(async (item) => ({
        id: item.id,
        productName: await t(item.productName),
        variantSize: item.variantSize,
        quantity: item.quantity,
        lineTotal: Number(item.unitPrice) * item.quantity,
      })),
    ),
  ]);

  return (
    <AccountShell name={session.name} active="pedidos">
      <div className="flex flex-col gap-8">
        <Link
          href="/pedidos"
          className="group -my-1.5 -ml-2 flex min-h-10 w-fit items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:text-foreground active:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          {copy.back}
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">
              {copy.order.replace("{id}", order.id.slice(0, 8))}
            </h2>
            <p className="text-sm text-muted-foreground">
              {copy.placedOn.replace("{date}", formatDate(order.createdAt, locale))}
            </p>
          </div>
          <OrderStatusBadge status={order.status} label={statusLabel} />
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-8">
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
              items={items}
              subtotal={Number(order.subtotal)}
              shippingEstimate={order.shippingCost === null ? null : Number(order.shippingCost)}
              copy={summaryCopy}
            />
          </div>

          <div className="flex flex-col gap-4 rounded-2xl bg-inverse p-5 text-inverse-foreground sm:p-6 lg:sticky lg:top-28">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-inverse-accent/15 text-inverse-accent">
              <Info className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="font-display text-xl">{message.title}</p>
            <p className="text-sm leading-relaxed text-inverse-muted">{message.description}</p>
          </div>
        </div>
      </div>
    </AccountShell>
  );
}
