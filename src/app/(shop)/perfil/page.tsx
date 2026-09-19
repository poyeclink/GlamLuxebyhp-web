import Link from "next/link";
import { Package, MapPin, User } from "lucide-react";
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
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-secondary-foreground">
            {session.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold text-foreground">{session.name}</h1>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>
        <Link href="/pedidos">
          <Button variant="outline" size="sm">
            <Package className="h-4 w-4" aria-hidden="true" />
            Mis pedidos
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-foreground">Datos personales</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <ProfileForm
              email={profile.email}
              defaultValues={{ name: profile.name, whatsapp: profile.whatsapp }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-foreground">Direcciones</h2>
          </div>
          <Link href="/perfil/direcciones/nueva">
            <Button size="sm">Agregar dirección</Button>
          </Link>
        </div>

        {addresses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
              <MapPin className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Todavía no tienes direcciones guardadas.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.map((address) => (
              <Card key={address.id}>
                <CardContent className="flex flex-col gap-3 p-4">
                  <AddressSummary address={address} />
                  <div className="flex items-center gap-2 border-t border-border pt-3">
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
