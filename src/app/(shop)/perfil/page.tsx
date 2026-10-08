import type { Metadata } from "next";
import Link from "next/link";
import { Camera, KeyRound, MapPin, Plus, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AccountSection, AccountShell } from "@/components/account/AccountShell";
import { ADDRESS_SUMMARY_COPY, AddressSummary } from "@/components/account/AddressSummary";
import { DeleteAddressButton } from "@/components/account/DeleteAddressButton";
import { ProfileForm } from "@/components/account/ProfileForm";
import { AvatarForm } from "@/components/account/AvatarForm";
import { r2PublicUrl } from "@/lib/r2";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { requireCustomer } from "@/lib/session";
import { t, tMany } from "@/lib/i18n";
import { listAddresses } from "@/server/services/address-service";
import { getCustomerProfile } from "@/server/services/user-service";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await t("Mi perfil") };
}

export default async function PerfilPage() {
  const session = await requireCustomer();
  const [profile, addresses, copy, addressCopy] = await Promise.all([
    getCustomerProfile(session.userId),
    listAddresses(session.userId),
    tMany({
      personalData: "Datos personales",
      photo: "Foto de perfil",
      photoText: "Se muestra en tu cuenta.",
      choose: "Agregar foto",
      change: "Cambiar foto",
      hint: "JPG, PNG o WEBP.",
      savePhoto: "Guardar foto",
      removePhoto: "Quitar foto",
      photoSaved: "Foto actualizada.",
      addresses: "Direcciones",
      addressesText: "Las usamos para agilizar tu checkout.",
      edit: "Editar",
      delete: "Eliminar",
      addAddress: "Agregar dirección",
      noAddresses: "Todavía no tienes direcciones guardadas.",
      email: "Correo",
      name: "Nombre",
      optional: "Opcional",
      saved: "Datos actualizados.",
      submit: "Guardar cambios",
      pending: "Enviando…",
      security: "Contraseña",
      securityText: "Te avisaremos por correo cada vez que cambie.",
      currentPassword: "Contraseña actual",
      newPassword: "Nueva contraseña",
      confirmPassword: "Repite la nueva contraseña",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
      forgot: "¿Olvidaste tu contraseña?",
      passwordSaved: "Contraseña actualizada.",
      savePassword: "Cambiar contraseña",
    }),
    tMany(ADDRESS_SUMMARY_COPY),
  ]);

  return (
    <AccountShell name={session.name} active="perfil">
      <div className="flex flex-col gap-14">
        <AccountSection icon={Camera} title={copy.photo} description={copy.photoText}>
          <Card>
            <CardContent className="p-5 sm:p-8">
              <AvatarForm
                avatarUrl={profile.avatarKey ? r2PublicUrl(profile.avatarKey) : null}
                fallback={profile.name.charAt(0).toUpperCase()}
                copy={{
                  choose: copy.choose,
                  change: copy.change,
                  hint: copy.hint,
                  save: copy.savePhoto,
                  remove: copy.removePhoto,
                  saved: copy.photoSaved,
                  pending: copy.pending,
                }}
              />
            </CardContent>
          </Card>
        </AccountSection>

        <AccountSection icon={User} title={copy.personalData} description={profile.email}>
          <Card>
            <CardContent className="p-5 sm:p-8">
              <ProfileForm
                email={profile.email}
                defaultValues={{ name: profile.name, whatsapp: profile.whatsapp }}
                copy={copy}
              />
            </CardContent>
          </Card>
        </AccountSection>

        <AccountSection icon={KeyRound} title={copy.security} description={copy.securityText}>
          <Card>
            <CardContent className="p-5 sm:p-8">
              <ChangePasswordForm copy={copy} />
            </CardContent>
          </Card>
        </AccountSection>

        <AccountSection
          id="direcciones"
          icon={MapPin}
          title={copy.addresses}
          description={copy.addressesText}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <Card
                key={address.id}
                className="hover-lift hover:border-foreground/30 hover:shadow-[0_20px_40px_-28px_rgba(10,10,11,0.45)]"
              >
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <AddressSummary address={address} copy={addressCopy} />
                  <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border pt-4 sm:flex sm:items-center [&_button]:w-full sm:[&_button]:w-auto">
                    <Link href={`/perfil/direcciones/${address.id}/editar`}>
                      <Button variant="outline" size="sm">
                        {copy.edit}
                      </Button>
                    </Link>
                    <DeleteAddressButton addressId={address.id} label={copy.delete} />
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
              <span className="text-sm font-medium text-foreground">{copy.addAddress}</span>
              {addresses.length === 0 && (
                <span className="text-xs text-muted-foreground">{copy.noAddresses}</span>
              )}
            </Link>
          </div>
        </AccountSection>
      </div>
    </AccountShell>
  );
}
