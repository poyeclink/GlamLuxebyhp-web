import { redirect } from "next/navigation";
import { ORDER_SUMMARY_COPY, OrderSummary } from "@/components/checkout/OrderSummary";
import { ConfirmOrderForm } from "@/components/checkout/ConfirmOrderForm";
import { requireCustomer } from "@/lib/session";
import { requireCheckoutCartAndAddress } from "@/lib/checkout";
import { t, tMany } from "@/lib/i18n";

export default async function CheckoutConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<{ addressId?: string; termsAcceptedAt?: string }>;
}) {
  const session = await requireCustomer();
  const { addressId, termsAcceptedAt } = await searchParams;
  const { cart, address } = await requireCheckoutCartAndAddress(session.userId, addressId);

  if (!termsAcceptedAt) redirect(`/checkout/resumen?addressId=${address.id}`);

  const [copy, summaryCopy, items] = await Promise.all([
    tMany({
      title: "Confirmar y pagar",
      paymentMethod: "Método de pago",
      card: "Tarjeta (pago seguro con Stripe)",
      submit: "Pagar ahora",
      pending: "Abriendo el pago…",
    }),
    tMany(ORDER_SUMMARY_COPY),
    Promise.all(
      cart.items.map(async (item) => ({ ...item, productName: await t(item.productName) })),
    ),
  ]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10 px-4 py-16">
      <h1 className="font-display text-3xl text-foreground sm:text-4xl">{copy.title}</h1>

      <OrderSummary
        address={address}
        items={items}
        subtotal={cart.subtotal}
        shippingEstimate={cart.shippingEstimate}
        copy={summaryCopy}
      />

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{copy.paymentMethod}</span>
        <span className="font-medium text-foreground">{copy.card}</span>
      </div>

      <ConfirmOrderForm
        addressId={address.id}
        termsAcceptedAt={termsAcceptedAt}
        submitLabel={copy.submit}
        pendingLabel={copy.pending}
      />
    </div>
  );
}
