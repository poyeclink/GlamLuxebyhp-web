import { notFound } from "next/navigation";
import { AddressForm } from "@/components/account/AddressForm";
import { updateAddressAction } from "@/server/actions/address-actions";
import { getAddressForEdit } from "@/server/services/address-service";
import { requireCustomer } from "@/lib/session";

export default async function EditarDireccionPage({
  params,
}: PageProps<"/perfil/direcciones/[id]/editar">) {
  const { id } = await params;
  const session = await requireCustomer();

  const address = await getAddressForEdit(session.userId, id);
  if (!address) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Editar dirección</h1>
      <AddressForm
        action={updateAddressAction.bind(null, id)}
        defaultValues={{
          fullName: address.fullName,
          whatsapp: address.whatsapp,
          email: address.email,
          addressLine: address.addressLine,
          addressType: address.addressType,
          city: address.city,
          state: address.state,
          zip: address.zip,
          notes: address.notes,
        }}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
