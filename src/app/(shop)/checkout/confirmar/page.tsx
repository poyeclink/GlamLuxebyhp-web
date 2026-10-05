import { redirect } from "next/navigation";
import { ORDER_SUMMARY_COPY, OrderSummary } from "@/components/checkout/OrderSummary";
import { ConfirmOrderForm } from "@/components/checkout/ConfirmOrderForm";
import { requireCustomer } from "@/lib/session";
import { requireCheckoutCartAndAddress } from "@/lib/checkout";
import { t, tMany } from "@/lib/i18n";
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

  const paymentMethodLabel =
    PAYMENT_METHOD_OPTIONS.find((option) => option.value === paymentMethod)?.label ?? paymentMethod;

  const [copy, summaryCopy, items, translatedPaymentMethod] = await Promise.all([
    tMany({ title: "Confirmar pedido", paymentMethod: "Método de pago" }),
    tMany(ORDER_SUMMARY_COPY),
    Promise.all(
      cart.items.map(async (item) => ({ ...item, productName: await t(item.productName) })),
    ),
    t(paymentMethodLabel),
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
        <span className="font-medium text-foreground">{translatedPaymentMethod}</span>
      </div>

      <ConfirmOrderForm
        addressId={address.id}
        termsAcceptedAt={termsAcceptedAt}
        paymentMethod={paymentMethod}
        submitLabel={copy.title}
        pendingLabel={await t("Enviando…")}
      />
    </div>
  );
}
