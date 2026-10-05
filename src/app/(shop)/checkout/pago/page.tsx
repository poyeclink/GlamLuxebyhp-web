import { redirect } from "next/navigation";
import { CART_TOTALS_COPY, CartTotals } from "@/components/shop/CartTotals";
import { PaymentMethodForm } from "@/components/checkout/PaymentMethodForm";
import { requireCustomer } from "@/lib/session";
import { requireCheckoutCartAndAddress } from "@/lib/checkout";
import { t, tMany } from "@/lib/i18n";
import { PAYMENT_METHOD_OPTIONS } from "@/server/services/payment-service";

export default async function CheckoutPagoPage({
  searchParams,
}: {
  searchParams: Promise<{ addressId?: string; termsAcceptedAt?: string }>;
}) {
  const session = await requireCustomer();
  const { addressId, termsAcceptedAt } = await searchParams;
  const { cart, address } = await requireCheckoutCartAndAddress(session.userId, addressId);

  if (!termsAcceptedAt) redirect(`/checkout/resumen?addressId=${address.id}`);

  const [copy, totalsCopy, options] = await Promise.all([
    tMany({ title: "Método de pago", submit: "Confirmar pedido" }),
    tMany(CART_TOTALS_COPY),
    Promise.all(
      PAYMENT_METHOD_OPTIONS.map(async (option) => ({ ...option, label: await t(option.label) })),
    ),
  ]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10 px-4 py-16">
      <h1 className="font-display text-3xl text-foreground sm:text-4xl">{copy.title}</h1>

      <CartTotals
        subtotal={cart.subtotal}
        shippingEstimate={cart.shippingEstimate}
        copy={totalsCopy}
      />

      <PaymentMethodForm
        addressId={address.id}
        termsAcceptedAt={termsAcceptedAt}
        options={options}
        submitLabel={copy.submit}
        pendingLabel={await t("Enviando…")}
      />
    </div>
  );
}
