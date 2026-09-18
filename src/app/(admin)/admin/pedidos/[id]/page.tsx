import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import {
  ORDER_STATUS_BADGE_VARIANT,
  getAllowedNextStatuses,
  getOrderForAdmin,
} from "@/server/services/order-service";
import { PAYMENT_METHOD_OPTIONS } from "@/server/services/payment-service";
import { formatDate } from "@/lib/utils";

export default async function AdminOrderDetailPage({
  params,
}: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  const order = await getOrderForAdmin(id);
  if (!order) notFound();

  const paymentMethodLabel =
    PAYMENT_METHOD_OPTIONS.find((option) => option.value === order.paymentMethod)?.label ??
    order.paymentMethod;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10 px-4 py-16">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Pedido de {order.fullName}</h1>
          <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>{order.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">Pedido del {formatDate(order.createdAt)}</p>
        <p className="text-sm text-muted-foreground">
          Contacto: {order.whatsapp} · {order.email}
        </p>
        <p className="text-sm text-muted-foreground">Método de pago: {paymentMethodLabel}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Estado del pedido</h2>
        <OrderStatusForm orderId={order.id} allowedNextStatuses={getAllowedNextStatuses(order.status)} />
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
