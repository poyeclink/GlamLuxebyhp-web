"use client";

import { useActionState } from "react";
import {
  adjustVariantStockAction,
  type InventoryActionState,
} from "@/server/actions/inventory-actions";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

const initialState: InventoryActionState = {};

export function AdjustStockForm({ variantId }: { variantId: string }) {
  const t = useAdminT();
  const [state, formAction] = useActionState(
    adjustVariantStockAction.bind(null, variantId),
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`delta-${variantId}`} className="text-sm font-medium text-foreground">
            {t("Ajuste (+/-)")}
          </label>
          {/* Sin inputMode="numeric": el teclado numérico de iOS no tiene signo
              menos y no se podría restar stock desde el iPhone. */}
          <Input
            id={`delta-${variantId}`}
            name="delta"
            type="number"
            step="1"
            placeholder={t("ej. -2 o 10")}
            className="sm:w-28"
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor={`note-${variantId}`} className="text-sm font-medium text-foreground">
            {t("Nota (opcional)")}
          </label>
          <Input id={`note-${variantId}`} name="note" placeholder={t("Motivo del ajuste")} />
        </div>
        <SubmitButton className="sm:w-auto" variant="outline" pendingLabel={t("Enviando…")}>
          {t("Ajustar")}
        </SubmitButton>
      </div>
      <FormError message={state.error} />
    </form>
  );
}
