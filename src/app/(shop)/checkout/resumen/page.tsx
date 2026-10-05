import { ORDER_SUMMARY_COPY, OrderSummary } from "@/components/checkout/OrderSummary";
import { TermsAcceptanceForm } from "@/components/checkout/TermsAcceptanceForm";
import { requireCustomer } from "@/lib/session";
import { requireCheckoutCartAndAddress } from "@/lib/checkout";
import { t, tMany } from "@/lib/i18n";

export default async function CheckoutResumenPage({
  searchParams,
}: {
  searchParams: Promise<{ addressId?: string }>;
}) {
  const session = await requireCustomer();
  const { addressId } = await searchParams;
  const { cart, address } = await requireCheckoutCartAndAddress(session.userId, addressId);
  const [copy, summaryCopy, items] = await Promise.all([
    tMany({
      title: "Resumen del pedido",
      terms: "Acepto los términos y condiciones de venta.",
      submit: "Continuar",
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

      <TermsAcceptanceForm
        addressId={address.id}
        copy={{ label: copy.terms, submit: copy.submit, pending: await t("Enviando…") }}
      />
    </div>
  );
}
