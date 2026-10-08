import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { STOCK_IMAGES } from "@/lib/stock-images";
import { LoginForm } from "@/components/auth/LoginForm";
import { t, tMany } from "@/lib/i18n";
import { WHOLESALE_ITEM_THRESHOLD } from "@/server/services/cart-service";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await t("Iniciar sesión"), robots: { index: false } };
}

export default async function LoginPage() {
  const copy = await tMany({
    eyebrow: "Mi cuenta",
    title: "Qué bueno verte otra vez",
    subtitle: "Inicia sesión para ver tus pedidos y completar tu compra.",
    brandTitle: "Tu próxima pieza favorita te está esperando.",
    point1: `Precio mayorista desde ${WHOLESALE_ITEM_THRESHOLD} artículos`,
    point2: "Confirmación inmediata al pagar",
    point3: "Seguimiento de cada pedido",
    email: "Correo",
    password: "Contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    forgot: "¿Olvidaste tu contraseña?",
    submit: "Iniciar sesión",
    pending: "Enviando…",
    noAccount: "¿No tienes cuenta?",
    register: "Regístrate",
  });

  return (
    <AuthShell
      eyebrow={copy.eyebrow}
      image={STOCK_IMAGES.redBlazer}
      title={copy.title}
      subtitle={copy.subtitle}
      brandTitle={copy.brandTitle}
      brandPoints={[copy.point1, copy.point2, copy.point3]}
    >
      <LoginForm copy={copy} />
    </AuthShell>
  );
}
