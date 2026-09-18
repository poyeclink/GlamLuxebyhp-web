import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AddressSummary } from "@/components/account/AddressSummary";
import { DeleteAddressButton } from "@/components/account/DeleteAddressButton";
import { ProfileForm } from "@/components/account/ProfileForm";
import { requireCustomer } from "@/lib/session";
import { listAddresses } from "@/server/services/address-service";
import { getCustomerProfile } from "@/server/services/user-service";

export default async function PerfilPage() {
  const session = await requireCustomer();
  const [profile, addresses] = await Promise.all([
    getCustomerProfile(session.userId),
    listAddresses(session.userId),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-16">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Mi cuenta</h1>
          <p className="text-muted-foreground">{session.name}</p>
        </div>
        <Link href="/pedidos">
          <Button variant="outline" size="sm">
            Mis pedidos
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Datos personales</h2>
        <Card>
          <CardContent className="p-4">
            <ProfileForm
              email={profile.email}
              defaultValues={{ name: profile.name, whatsapp: profile.whatsapp }}
            />
          </CardContent>
        </Card>
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
                  <AddressSummary address={address} />
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
