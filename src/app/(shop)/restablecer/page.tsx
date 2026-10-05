import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Button } from "@/components/ui/Button";
import { t, tMany } from "@/lib/i18n";
import { getUserForResetToken } from "@/server/services/auth-service";

export async function generateMetadata(): Promise<Metadata> {
  // El token viaja en la URL: que no se filtre en el Referer de ningún recurso.
  return { title: await t("Nueva contraseña"), robots: { index: false }, referrer: "no-referrer" };
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const validToken =
    typeof token === "string" && (await getUserForResetToken(token)) ? token : null;

  const copy = await tMany({
    eyebrow: "Mi cuenta",
    title: "Crea una nueva contraseña",
    subtitle: "Usa al menos 8 caracteres. Al guardarla entrarás directo a tu cuenta.",
    invalidTitle: "Este enlace ya no sirve",
    invalidSubtitle:
      "El enlace venció o ya se usó. Pide uno nuevo y te lo enviamos al instante.",
    requestNew: "Pedir un enlace nuevo",
    brandTitle: "Vuelve a tu cuenta en un minuto.",
    point1: "Enlace de un solo uso",
    point2: "Te avisamos por correo del cambio",
    point3: "Tus pedidos y direcciones siguen intactos",
    password: "Nueva contraseña",
    confirmPassword: "Repite la contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    submit: "Guardar contraseña",
    pending: "Enviando…",
  });

  return (
    <AuthShell
      eyebrow={copy.eyebrow}
      title={validToken ? copy.title : copy.invalidTitle}
      subtitle={validToken ? copy.subtitle : copy.invalidSubtitle}
      brandTitle={copy.brandTitle}
      brandPoints={[copy.point1, copy.point2, copy.point3]}
    >
      {validToken ? (
        <ResetPasswordForm token={validToken} copy={copy} />
      ) : (
        <Link href="/recuperar">
          <Button size="lg" className="w-full">
            {copy.requestNew}
          </Button>
        </Link>
      )}
    </AuthShell>
  );
}
