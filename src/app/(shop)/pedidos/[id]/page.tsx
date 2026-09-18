import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { requireCustomer } from "@/lib/session";
import {
  ORDER_STATUS_BADGE_VARIANT,
  getOrderForCustomer,
  getOrderStatusMessage,
} from "@/server/services/order-service";
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
    <div className="mx-auto flex max-w-lg flex-col gap-10 px-4 py-16">
      <div className="flex flex-col gap-3">
        <Link href="/pedidos" className="text-sm text-muted-foreground hover:text-foreground">
          ← Mis pedidos
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>{order.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">
          Pedido del {formatDate(order.createdAt)}
        </p>
      </div>

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
  );
}
