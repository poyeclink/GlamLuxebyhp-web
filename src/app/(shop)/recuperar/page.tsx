import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { t, tMany } from "@/lib/i18n";
import { RESET_TOKEN_MINUTES } from "@/lib/password-reset";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await t("Recuperar contraseña"), robots: { index: false } };
}

export default async function RecoverPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string }>;
}) {
  const { desde } = await searchParams;
  const copy = await tMany({
    eyebrow: "Mi cuenta",
    title: "¿Olvidaste tu contraseña?",
    subtitle: "Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva.",
    brandTitle: "Vuelve a tu cuenta en un minuto.",
    point1: "Enlace seguro a tu correo",
    point2: `Vence en ${RESET_TOKEN_MINUTES} minutos`,
    point3: "Tus pedidos y direcciones siguen intactos",
    email: "Correo",
    submit: "Enviar enlace",
    pending: "Enviando…",
    sentTitle: "Revisa tu correo",
    sentText:
      "Si hay una cuenta con ese correo, te llegará un enlace para restablecer tu contraseña en unos minutos. Revisa también la carpeta de spam.",
    back: "Volver a iniciar sesión",
  });

  return (
    <AuthShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      brandTitle={copy.brandTitle}
      brandPoints={[copy.point1, copy.point2, copy.point3]}
    >
      <ForgotPasswordForm copy={copy} backHref={desde === "admin" ? "/acceso-admin" : "/login"} />
    </AuthShell>
  );
}
