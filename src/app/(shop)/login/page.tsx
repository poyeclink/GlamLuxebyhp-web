import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { STOCK_IMAGES } from "@/lib/stock-images";
import { LoginForm } from "@/components/auth/LoginForm";
import { WHOLESALE_ITEM_THRESHOLD } from "@/server/services/cart-service";

export const metadata: Metadata = { title: "Iniciar sesión", robots: { index: false } };

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Mi cuenta"
      image={STOCK_IMAGES.redBlazer}
      title="Qué bueno verte otra vez"
      subtitle="Inicia sesión para ver tus pedidos y completar tu compra."
      brandTitle="Tu próxima pieza favorita te está esperando."
      brandPoints={[
        `Precio mayorista desde ${WHOLESALE_ITEM_THRESHOLD} artículos`,
        "Pedidos reservados 3 días",
        "Seguimiento de cada pedido",
      ]}
    >
      <LoginForm />
    </AuthShell>
  );
}
