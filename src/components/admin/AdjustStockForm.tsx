"use client";

import { useActionState } from "react";
import { adjustVariantStockAction, type InventoryActionState } from "@/server/actions/inventory-actions";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

const initialState: InventoryActionState = {};

export function AdjustStockForm({ variantId }: { variantId: string }) {
  const [state, formAction] = useActionState(
    adjustVariantStockAction.bind(null, variantId),
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`delta-${variantId}`} className="text-sm font-medium text-foreground">
            Ajuste (+/-)
          </label>
          <Input
            id={`delta-${variantId}`}
            name="delta"
            type="number"
            placeholder="ej. -2 o 10"
            className="w-28"
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor={`note-${variantId}`} className="text-sm font-medium text-foreground">
            Nota (opcional)
          </label>
          <Input id={`note-${variantId}`} name="note" placeholder="Motivo del ajuste" />
        </div>
        <SubmitButton className="w-auto" variant="outline">
          Ajustar
        </SubmitButton>
      </div>
      <FormError message={state.error} />
    </form>
  );
}
