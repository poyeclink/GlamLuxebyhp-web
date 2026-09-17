import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AddressSummary } from "@/components/account/AddressSummary";
import { AddressForm } from "@/components/account/AddressForm";
import { createCheckoutAddressAction } from "@/server/actions/checkout-actions";
import { requireCustomer } from "@/lib/session";
import { getCartWithPricing } from "@/server/services/cart-service";
import { listAddresses } from "@/server/services/address-service";

export default async function CheckoutDireccionPage() {
  const session = await requireCustomer();
  const cart = await getCartWithPricing({ userId: session.userId });
  if (cart.items.length === 0) redirect("/carrito");

  const addresses = await listAddresses(session.userId);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Dirección de envío</h1>

      {addresses.length > 0 ? (
        <div className="flex flex-col gap-3">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <AddressSummary address={address} />
                <Link href={`/checkout/resumen?addressId=${address.id}`}>
                  <Button size="sm">Usar esta dirección</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          {addresses.length > 0 ? "O agrega una nueva dirección" : "Agrega tu dirección de envío"}
        </h2>
        <AddressForm action={createCheckoutAddressAction} submitLabel="Continuar" />
      </div>
    </div>
  );
}
