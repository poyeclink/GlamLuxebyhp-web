import { notFound } from "next/navigation";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { getAllowedNextStatuses, getOrderForAdmin } from "@/server/services/order-service";
import { paymentMethodLabel } from "@/server/services/report-service";
import { formatDate } from "@/lib/utils";

const CONTACT_BUTTON =
  "inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-10";

export default async function AdminOrderDetailPage({ params }: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  const order = await getOrderForAdmin(id);
  if (!order) notFound();

  const phoneDigits = order.whatsapp.replace(/\D/g, "");
  // wa.me exige el código de país; un número de EE.UU. de 10 dígitos sin el 1 no abre el chat.
  const whatsappDigits = phoneDigits.length === 10 ? `1${phoneDigits}` : phoneDigits;

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

        <div className="order-first flex flex-col gap-6 lg:sticky lg:top-8 lg:order-none">
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
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">Contacto</span>
                {whatsappDigits && (
                  <a
                    href={`https://wa.me/${whatsappDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${CONTACT_BUTTON} bg-primary text-primary-foreground hover:bg-primary/90`}
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    WhatsApp · {order.whatsapp}
                  </a>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {phoneDigits && (
                    <a
                      href={`tel:${order.whatsapp.replace(/[^\d+]/g, "")}`}
                      className={`${CONTACT_BUTTON} border border-input hover:border-foreground`}
                    >
                      <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Llamar
                    </a>
                  )}
                  <a
                    href={`mailto:${order.email}`}
                    className={`${CONTACT_BUTTON} border border-input hover:border-foreground`}
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Correo
                  </a>
                </div>
                <span className="break-all text-muted-foreground">{order.email}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Método de pago</span>
                <span className="text-foreground">{paymentMethodLabel(order.paymentMethod)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
