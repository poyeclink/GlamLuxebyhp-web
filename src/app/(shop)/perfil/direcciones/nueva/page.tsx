import { AddressForm } from "@/components/account/AddressForm";
import { createAddressAction } from "@/server/actions/address-actions";

export default function NuevaDireccionPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Nueva dirección</h1>
      <AddressForm action={createAddressAction} submitLabel="Guardar dirección" />
    </div>
  );
}
