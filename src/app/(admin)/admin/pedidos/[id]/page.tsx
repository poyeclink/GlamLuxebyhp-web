import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { getAllowedNextStatuses, getOrderForAdmin } from "@/server/services/order-service";
import { PAYMENT_METHOD_OPTIONS } from "@/server/services/payment-service";
import { formatDate } from "@/lib/utils";

export default async function AdminOrderDetailPage({ params }: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  const order = await getOrderForAdmin(id);
  if (!order) notFound();

  const paymentMethodLabel =
    PAYMENT_METHOD_OPTIONS.find((option) => option.value === order.paymentMethod)?.label ??
    order.paymentMethod;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        back={{ href: "/admin/pedidos", label: "Volver a pedidos" }}
        eyebrow={`Pedido #${order.id.slice(0, 8)} · ${formatDate(order.createdAt)}`}
        title={`Pedido de ${order.fullName}`}
        action={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
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

        <div className="flex flex-col gap-6 lg:sticky lg:top-8">
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
