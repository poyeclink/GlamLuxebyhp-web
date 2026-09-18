import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { AddressSummary } from "@/components/account/AddressSummary";
import { CartTotals } from "@/components/shop/CartTotals";
import { TermsAcceptanceForm } from "@/components/checkout/TermsAcceptanceForm";
import { requireCustomer } from "@/lib/session";
import { getCartWithPricing } from "@/server/services/cart-service";
import { getAddressForEdit } from "@/server/services/address-service";
import { formatCurrency } from "@/lib/utils";

export default async function CheckoutResumenPage({
  searchParams,
}: {
  searchParams: Promise<{ addressId?: string }>;
}) {
  const session = await requireCustomer();
  const cart = await getCartWithPricing({ userId: session.userId });
  if (cart.items.length === 0) redirect("/carrito");

  const { addressId } = await searchParams;
  // addressId viene de un query string editable por el usuario — se revalida
  // dueño con el mismo helper que /perfil, no un findUnique directo (ver
  // sección "Checkout" de CLAUDE.md).
  const address = addressId ? await getAddressForEdit(session.userId, addressId) : null;
  if (!address) redirect("/checkout/direccion");

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Resumen del pedido</h1>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Dirección de envío</h2>
        <Card>
          <CardContent className="p-4">
            <AddressSummary address={address} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Artículos</h2>
        <ul className="flex flex-col divide-y divide-border">
          {cart.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="text-foreground">
                {item.productName}
                {item.variantSize ? ` (${item.variantSize})` : ""} × {item.quantity}
              </span>
              <span className="text-muted-foreground">{formatCurrency(item.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <CartTotals subtotal={cart.subtotal} shippingEstimate={cart.shippingEstimate} />
      </div>

      <TermsAcceptanceForm addressId={address.id} />
    </div>
  );
}
