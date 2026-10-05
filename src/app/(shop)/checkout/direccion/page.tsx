import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ADDRESS_SUMMARY_COPY, AddressSummary } from "@/components/account/AddressSummary";
import { AddressForm } from "@/components/account/AddressForm";
import { ADDRESS_FORM_COPY } from "@/components/account/address-form-copy";
import { createCheckoutAddressAction } from "@/server/actions/checkout-actions";
import { requireCustomer } from "@/lib/session";
import { getCartWithPricing } from "@/server/services/cart-service";
import { listAddresses } from "@/server/services/address-service";
import { tMany } from "@/lib/i18n";

export default async function CheckoutDireccionPage() {
  const session = await requireCustomer();
  const cart = await getCartWithPricing({ userId: session.userId });
  if (cart.items.length === 0) redirect("/carrito");

  const [addresses, copy, addressCopy, formCopy] = await Promise.all([
    listAddresses(session.userId),
    tMany({
      title: "Dirección de envío",
      useAddress: "Usar esta dirección",
      addAnother: "O agrega una nueva dirección",
      addFirst: "Agrega tu dirección de envío",
      submit: "Continuar",
    }),
    tMany(ADDRESS_SUMMARY_COPY),
    tMany(ADDRESS_FORM_COPY),
  ]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10 px-4 py-16">
      <h1 className="font-display text-3xl text-foreground sm:text-4xl">{copy.title}</h1>

      {addresses.length > 0 ? (
        <div className="flex flex-col gap-3">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <AddressSummary address={address} copy={addressCopy} />
                <Link href={`/checkout/resumen?addressId=${address.id}`}>
                  <Button size="sm">{copy.useAddress}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl text-foreground">
          {addresses.length > 0 ? copy.addAnother : copy.addFirst}
        </h2>
        <AddressForm action={createCheckoutAddressAction} submitLabel={copy.submit} copy={formCopy} />
      </div>
    </div>
  );
}
