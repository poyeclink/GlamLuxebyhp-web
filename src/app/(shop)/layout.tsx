import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SignupGate } from "@/components/layout/SignupGate";
import { getSession } from "@/lib/session";
import { tMany } from "@/lib/i18n";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const gateCopy = session
    ? null
    : await tMany({
        eyebrow: "Mi cuenta",
        title: "Regístrate para seguir viendo",
        body: "Crea tu cuenta gratis o inicia sesión para ver toda la colección.",
        register: "Crear cuenta",
        login: "Ya tengo cuenta",
      });

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {gateCopy && <SignupGate copy={gateCopy} />}
    </div>
  );
}
