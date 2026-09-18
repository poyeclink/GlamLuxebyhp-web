import { redirect } from "next/navigation";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ConfirmOrderForm } from "@/components/checkout/ConfirmOrderForm";
import { requireCustomer } from "@/lib/session";
import { requireCheckoutCartAndAddress } from "@/lib/checkout";
import { isPaymentMethod, PAYMENT_METHOD_OPTIONS } from "@/server/services/payment-service";

export default async function CheckoutConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<{ addressId?: string; termsAcceptedAt?: string; paymentMethod?: string }>;
}) {
  const session = await requireCustomer();
  const { addressId, termsAcceptedAt, paymentMethod } = await searchParams;
  const { cart, address } = await requireCheckoutCartAndAddress(session.userId, addressId);

  if (!termsAcceptedAt) redirect(`/checkout/resumen?addressId=${address.id}`);
  if (!isPaymentMethod(paymentMethod)) {
    redirect(
      `/checkout/pago?addressId=${address.id}&termsAcceptedAt=${encodeURIComponent(termsAcceptedAt)}`,
    );
  }

  const paymentMethodLabel = PAYMENT_METHOD_OPTIONS.find(
    (option) => option.value === paymentMethod,
  )?.label;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Confirmar pedido</h1>

      <OrderSummary
        address={address}
        items={cart.items}
        subtotal={cart.subtotal}
        shippingEstimate={cart.shippingEstimate}
      />

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Método de pago</span>
        <span className="font-medium text-foreground">{paymentMethodLabel}</span>
      </div>

      <ConfirmOrderForm addressId={address.id} termsAcceptedAt={termsAcceptedAt} paymentMethod={paymentMethod} />
    </div>
  );
}
