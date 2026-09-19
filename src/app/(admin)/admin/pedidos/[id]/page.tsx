import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-16">
      <Link href="/admin/pedidos" className="text-sm text-muted-foreground hover:text-foreground">
        ← Volver a pedidos
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Pedido de {order.fullName}</h1>
          <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>{order.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          #{order.id.slice(0, 8)} · {formatDate(order.createdAt)}
        </p>
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

        <div className="flex flex-col gap-6 lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estado del pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusForm
                orderId={order.id}
                allowedNextStatuses={getAllowedNextStatuses(order.status)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Contacto</span>
                <span className="text-foreground">{order.whatsapp}</span>
                <span className="text-foreground">{order.email}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Método de pago</span>
                <span className="text-foreground">{paymentMethodLabel}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
