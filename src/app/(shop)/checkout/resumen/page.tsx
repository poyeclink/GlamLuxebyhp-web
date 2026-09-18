import { OrderSummary } from "@/components/checkout/OrderSummary";
import { TermsAcceptanceForm } from "@/components/checkout/TermsAcceptanceForm";
import { requireCustomer } from "@/lib/session";
import { requireCheckoutCartAndAddress } from "@/lib/checkout";

export default async function CheckoutResumenPage({
  searchParams,
}: {
  searchParams: Promise<{ addressId?: string }>;
}) {
  const session = await requireCustomer();
  const { addressId } = await searchParams;
  const { cart, address } = await requireCheckoutCartAndAddress(session.userId, addressId);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Resumen del pedido</h1>

      <OrderSummary
        address={address}
        items={cart.items}
        subtotal={cart.subtotal}
        shippingEstimate={cart.shippingEstimate}
      />

      <TermsAcceptanceForm addressId={address.id} />
    </div>
  );
}
