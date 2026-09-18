"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import type { ShippingActionState } from "@/server/actions/shipping-actions";

// PricingTier son solo estos dos valores (enum del schema) — no vale la pena
// un archivo de constantes aparte (como PAYMENT_METHOD_OPTIONS) para un
// select con dos opciones fijas usado en un solo formulario.
const TIER_OPTIONS = [
  { value: "individual", label: "Individual" },
  { value: "mayorista", label: "Mayorista" },
] as const;

const initialState: ShippingActionState = {};

export function ShippingRateForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ShippingActionState, formData: FormData) => Promise<ShippingActionState>;
  defaultValues?: { tier: string; minQuantity: number; maxQuantity: number | null; price: number };
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <SelectField label="Tier" name="tier" defaultValue={defaultValues?.tier} required>
        {TIER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <TextField
        label="Cantidad mínima"
        name="minQuantity"
        type="number"
        min="1"
        defaultValue={defaultValues?.minQuantity}
        required
      />
      <TextField
        label="Cantidad máxima (vacío = sin límite)"
        name="maxQuantity"
        type="number"
        min="1"
        defaultValue={defaultValues?.maxQuantity ?? undefined}
      />
      <TextField
        label="Precio"
        name="price"
        type="number"
        step="0.01"
        min="0"
        defaultValue={defaultValues?.price}
        required
      />
      <FormError message={state.error} />
      <SubmitButton className="sm:w-auto">{submitLabel}</SubmitButton>
    </form>
  );
}
