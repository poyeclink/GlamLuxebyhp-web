import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { AddressForm } from "@/components/account/AddressForm";
import { createAddressAction } from "@/server/actions/address-actions";
import { requireCustomer } from "@/lib/session";
import { tMany } from "@/lib/i18n";
import { ADDRESS_FORM_COPY } from "@/components/account/address-form-copy";

export default async function NuevaDireccionPage() {
  const session = await requireCustomer();
  const [copy, formCopy] = await Promise.all([
    tMany({ back: "Volver a direcciones", title: "Nueva dirección", submit: "Guardar dirección" }),
    tMany(ADDRESS_FORM_COPY),
  ]);

  return (
    <AccountShell name={session.name} active="direcciones">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <Link
          href="/perfil#direcciones"
          className="group -my-1.5 -ml-2 flex min-h-10 w-fit items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:text-foreground active:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          {copy.back}
        </Link>
        <h2 className="font-display text-3xl text-foreground sm:text-4xl">{copy.title}</h2>
        <div className="rounded-2xl border border-border bg-background p-5 sm:p-8">
          <AddressForm action={createAddressAction} submitLabel={copy.submit} copy={formCopy} />
        </div>
      </div>
    </AccountShell>
  );
}
