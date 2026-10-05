import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { notFound } from "next/navigation";
import { AddressForm } from "@/components/account/AddressForm";
import { updateAddressAction } from "@/server/actions/address-actions";
import { getAddressForEdit } from "@/server/services/address-service";
import { requireCustomer } from "@/lib/session";
import { tMany } from "@/lib/i18n";
import { ADDRESS_FORM_COPY } from "@/components/account/address-form-copy";

export default async function EditarDireccionPage({
  params,
}: PageProps<"/perfil/direcciones/[id]/editar">) {
  const { id } = await params;
  const session = await requireCustomer();

  const [address, copy, formCopy] = await Promise.all([
    getAddressForEdit(session.userId, id),
    tMany({ back: "Volver a direcciones", title: "Editar dirección", submit: "Guardar cambios" }),
    tMany(ADDRESS_FORM_COPY),
  ]);
  if (!address) notFound();

  return (
    <AccountShell name={session.name} active="direcciones">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <Link
          href="/perfil#direcciones"
          className="group flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          {copy.back}
        </Link>
        <h2 className="font-display text-3xl text-foreground sm:text-4xl">{copy.title}</h2>
        <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
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
            submitLabel={copy.submit}
            copy={formCopy}
          />
        </div>
      </div>
    </AccountShell>
  );
}
