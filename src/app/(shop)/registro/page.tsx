import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { STOCK_IMAGES } from "@/lib/stock-images";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { t, tMany } from "@/lib/i18n";
import { WHOLESALE_ITEM_THRESHOLD } from "@/server/services/cart-service";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await t("Crear cuenta"), robots: { index: false } };
}

export default async function RegisterPage() {
  const copy = await tMany({
    eyebrow: "Nueva cuenta",
    title: "Crea tu cuenta",
    subtitle: "Guarda tus direcciones, sigue tus pedidos y compra más rápido.",
    brandTitle: "Moda de alta calidad, al detalle o al por mayor.",
    point1: "Registro gratis, sin compromisos",
    point2: `Precio mayorista automático desde ${WHOLESALE_ITEM_THRESHOLD} artículos`,
    point3: "Tu carrito se conserva al registrarte",
    name: "Nombre",
    email: "Correo",
    password: "Contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    submit: "Crear cuenta",
    pending: "Enviando…",
    hasAccount: "¿Ya tienes cuenta?",
    login: "Inicia sesión",
  });

  return (
    <AuthShell
      eyebrow={copy.eyebrow}
      image={STOCK_IMAGES.mirrorDress}
      title={copy.title}
      subtitle={copy.subtitle}
      brandTitle={copy.brandTitle}
      brandPoints={[copy.point1, copy.point2, copy.point3]}
    >
      <RegisterForm copy={copy} />
    </AuthShell>
  );
}
