import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Plus, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AccountSection, AccountShell } from "@/components/account/AccountShell";
import { AddressSummary } from "@/components/account/AddressSummary";
import { DeleteAddressButton } from "@/components/account/DeleteAddressButton";
import { ProfileForm } from "@/components/account/ProfileForm";
import { requireCustomer } from "@/lib/session";
import { listAddresses } from "@/server/services/address-service";
import { getCustomerProfile } from "@/server/services/user-service";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function PerfilPage() {
  const session = await requireCustomer();
  const [profile, addresses] = await Promise.all([
    getCustomerProfile(session.userId),
    listAddresses(session.userId),
  ]);

  return (
    <AccountShell name={session.name} active="perfil">
      <div className="flex flex-col gap-14">
        <AccountSection icon={User} title="Datos personales" description={profile.email}>
          <Card>
            <CardContent className="p-6 sm:p-8">
              <ProfileForm
                email={profile.email}
                defaultValues={{ name: profile.name, whatsapp: profile.whatsapp }}
              />
            </CardContent>
          </Card>
        </AccountSection>

        <AccountSection
          id="direcciones"
          icon={MapPin}
          title="Direcciones"
          description="Las usamos para agilizar tu checkout."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <Card
                key={address.id}
                className="hover-lift hover:border-foreground/30 hover:shadow-[0_20px_40px_-28px_rgba(10,10,11,0.45)]"
              >
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <AddressSummary address={address} />
                  <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
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
            <Link
              href="/perfil/direcciones/nueva"
              className="group flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-input p-6 text-center transition-colors duration-300 hover:border-accent hover:bg-accent-soft/50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-inverse text-inverse-accent transition-transform duration-300 group-hover:rotate-90">
                <Plus className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-foreground">Agregar dirección</span>
              {addresses.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  Todavía no tienes direcciones guardadas.
                </span>
              )}
            </Link>
          </div>
        </AccountSection>
      </div>
    </AccountShell>
  );
}
