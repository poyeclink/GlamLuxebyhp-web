import type { PaymentMethod } from "@/generated/prisma/client";

// PaymentMethodConfig (ticket #36) todavía no existe: por ahora se muestran
// siempre los cuatro métodos. Cuando exista ese modelo, este listado pasa a
// filtrarse por el flag "habilitado" en vez de ser estático.
export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "tarjeta", label: "Tarjeta" },
  { value: "zelle", label: "Zelle" },
  { value: "cashapp", label: "Cash App" },
  { value: "paypal", label: "PayPal" },
];

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return PAYMENT_METHOD_OPTIONS.some((option) => option.value === value);
}
