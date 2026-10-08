import type { PaymentMethod } from "@/generated/prisma/client";

// Etiquetas para reportes y pedidos históricos. El checkout solo cobra con
// tarjeta (Stripe): Zelle/Cash App/PayPal quedan de pedidos anteriores.
export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "tarjeta", label: "Tarjeta" },
  { value: "zelle", label: "Zelle" },
  { value: "cashapp", label: "Cash App" },
  { value: "paypal", label: "PayPal" },
];

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return PAYMENT_METHOD_OPTIONS.some((option) => option.value === value);
}
