"use client";

import { useActionState } from "react";
import {
  createVariantAction,
  deleteVariantAction,
  updateVariantAction,
  type VariantActionState,
} from "@/server/actions/product-variant-actions";
import { setVariantSoldOutAction } from "@/server/actions/inventory-actions";
import { AvailabilityToggle } from "@/components/admin/AvailabilityToggle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";

export type VariantItem = {
  id: string;
  size: string;
  soldOut: boolean;
};

const initialState: VariantActionState = {};

function VariantRow({ productId, variant }: { productId: string; variant: VariantItem }) {
  const t = useAdminT();
  const [state, formAction] = useActionState(
    updateVariantAction.bind(null, variant.id, productId),
    initialState,
  );

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:rounded-none sm:border-0 sm:border-b sm:px-0 sm:py-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form action={formAction} className="flex items-center gap-2">
          <Input
            name="size"
            defaultValue={variant.size}
            aria-label={t("Talla")}
            className="w-20"
            required
          />
          <SubmitButton
            variant="outline"
            size="sm"
            className="w-auto"
            pendingLabel={t("Enviando…")}
          >
            {t("Guardar")}
          </SubmitButton>
        </form>
        <div className="flex items-center justify-between gap-2 sm:contents">
          <AvailabilityToggle
            soldOut={variant.soldOut}
            action={setVariantSoldOutAction.bind(null, variant.id, !variant.soldOut)}
          />
          <form
            action={deleteVariantAction.bind(null, variant.id, productId)}
            className="sm:ml-auto"
          >
            <Button type="submit" variant="ghost" size="sm" className="text-destructive">
              {t("Eliminar")}
            </Button>
          </form>
        </div>
      </div>
      <FormError message={state.error} />
    </div>
  );
}

export function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: VariantItem[];
}) {
  const t = useAdminT();
  const [state, formAction] = useActionState(
    createVariantAction.bind(null, productId),
    initialState,
  );

  return (
    <div className="flex flex-col gap-3 sm:gap-2">
      {variants.map((variant) => (
        <VariantRow key={variant.id} productId={productId} variant={variant} />
      ))}

      <form action={formAction} className="flex items-center gap-2 pt-2">
        <Input
          name="size"
          placeholder={t("Talla")}
          aria-label={t("Talla")}
          className="min-w-0 flex-1 sm:w-20 sm:flex-none"
          required
        />
        <SubmitButton className="w-auto" pendingLabel={t("Enviando…")}>
          {t("Agregar talla")}
        </SubmitButton>
      </form>
      <FormError message={state.error} />
    </div>
  );
}
