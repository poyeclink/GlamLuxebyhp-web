import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { STOCK_IMAGES } from "@/lib/stock-images";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { WHOLESALE_ITEM_THRESHOLD } from "@/server/services/cart-service";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Nueva cuenta"
      image={STOCK_IMAGES.mirrorDress}
      title="Crea tu cuenta"
      subtitle="Guarda tus direcciones, sigue tus pedidos y compra más rápido."
      brandTitle="Moda de alta calidad, al detalle o al por mayor."
      brandPoints={[
        "Registro gratis, sin compromisos",
        `Precio mayorista automático desde ${WHOLESALE_ITEM_THRESHOLD} artículos`,
        "Tu carrito se conserva al registrarte",
      ]}
    >
      <RegisterForm />
    </AuthShell>
  );
}
