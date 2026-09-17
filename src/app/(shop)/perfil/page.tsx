import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DeleteAddressButton } from "@/components/account/DeleteAddressButton";
import { requireCustomer } from "@/lib/session";
import { listAddresses } from "@/server/services/address-service";

export default async function PerfilPage() {
  const session = await requireCustomer();
  const addresses = await listAddresses(session.userId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Mi cuenta</h1>
        <p className="text-muted-foreground">{session.name}</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Direcciones</h2>
          <Link href="/perfil/direcciones/nueva">
            <Button size="sm">Agregar dirección</Button>
          </Link>
        </div>

        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no tienes direcciones guardadas.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.map((address) => (
              <Card key={address.id}>
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div className="flex flex-col gap-0.5 text-sm">
                    <span className="font-medium text-foreground">{address.fullName}</span>
                    <span className="text-muted-foreground">{address.addressLine}</span>
                    <span className="text-muted-foreground">
                      {address.city}, {address.state} {address.zip}
                    </span>
                    <span className="text-muted-foreground">
                      {address.addressType === "casa" ? "Casa" : "Apartamento"} · {address.whatsapp}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Link href={`/perfil/direcciones/${address.id}/editar`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <DeleteAddressButton addressId={address.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
