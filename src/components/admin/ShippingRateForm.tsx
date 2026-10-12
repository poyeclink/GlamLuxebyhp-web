"use client";

import { useActionState, useEffect } from "react";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";
import type { ShippingActionState } from "@/server/actions/shipping-actions";

const initialState: ShippingActionState = {};

export function ShippingRateForm({
  action,
  defaultValues,
  submitLabel,
  onSuccess,
}: {
  action: (prevState: ShippingActionState, formData: FormData) => Promise<ShippingActionState>;
  defaultValues?: { minQuantity: number; maxQuantity: number | null; price: number };
  submitLabel: string;
  onSuccess?: () => void;
}) {
  const t = useAdminT();
  const [state, formAction] = useActionState(action, initialState);

  // El formulario vive en un modal (categorías/envíos): sin redirect a una
  // página aparte, esto es lo que le avisa al modal que ya puede cerrarse.
  useEffect(() => {
    if (state.success) onSuccess?.();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label={t("Cantidad mínima")}
        name="minQuantity"
        type="number"
        inputMode="numeric"
        min="1"
        defaultValue={defaultValues?.minQuantity}
        required
      />
      <TextField
        label={t("Cantidad máxima (vacío = sin límite)")}
        name="maxQuantity"
        type="number"
        inputMode="numeric"
        min="1"
        defaultValue={defaultValues?.maxQuantity ?? undefined}
      />
      <TextField
        label={t("Precio")}
        name="price"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        defaultValue={defaultValues?.price}
        required
      />
      <FormError message={state.error} />
      <SubmitButton className="sm:w-auto" pendingLabel={t("Enviando…")}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
