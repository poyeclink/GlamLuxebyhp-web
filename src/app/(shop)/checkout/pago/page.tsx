import { redirect } from "next/navigation";
import { CartTotals } from "@/components/shop/CartTotals";
import { PaymentMethodForm } from "@/components/checkout/PaymentMethodForm";
import { requireCustomer } from "@/lib/session";
import { requireCheckoutCartAndAddress } from "@/lib/checkout";

export default async function CheckoutPagoPage({
  searchParams,
}: {
  searchParams: Promise<{ addressId?: string; termsAcceptedAt?: string }>;
}) {
  const session = await requireCustomer();
  const { addressId, termsAcceptedAt } = await searchParams;
  const { cart, address } = await requireCheckoutCartAndAddress(session.userId, addressId);

  if (!termsAcceptedAt) redirect(`/checkout/resumen?addressId=${address.id}`);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Método de pago</h1>

      <CartTotals subtotal={cart.subtotal} shippingEstimate={cart.shippingEstimate} />

      <PaymentMethodForm addressId={address.id} termsAcceptedAt={termsAcceptedAt} />
    </div>
  );
}
