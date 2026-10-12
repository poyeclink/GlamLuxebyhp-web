"use client";

import { useActionState } from "react";
import {
  createVariantAction,
  deleteVariantAction,
  updateVariantAction,
  type VariantActionState,
} from "@/server/actions/product-variant-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";

export type VariantItem = {
  id: string;
  size: string;
  stock: number;
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
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
        <form action={formAction} className="contents">
          <label className="flex flex-col gap-1 sm:w-20">
            <span className="text-xs text-muted-foreground sm:sr-only">{t("Talla")}</span>
            <Input name="size" defaultValue={variant.size} required />
          </label>
          <label className="flex flex-col gap-1 sm:w-24">
            <span className="text-xs text-muted-foreground sm:sr-only">{t("Stock")}</span>
            <Input
              name="stock"
              type="number"
              inputMode="numeric"
              min="0"
              defaultValue={variant.stock}
              required
            />
          </label>
          <SubmitButton
            variant="outline"
            size="sm"
            className="sm:w-auto"
            pendingLabel={t("Enviando…")}
          >
            {t("Guardar")}
          </SubmitButton>
        </form>
        <form action={deleteVariantAction.bind(null, variant.id, productId)} className="contents">
          <Button type="submit" variant="ghost" size="sm" className="text-destructive">
            {t("Eliminar")}
          </Button>
        </form>
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

      <form action={formAction} className="grid grid-cols-2 gap-2 pt-2 sm:flex sm:items-center">
        <Input
          name="size"
          placeholder={t("Talla")}
          aria-label={t("Talla")}
          className="sm:w-20"
          required
        />
        <Input
          name="stock"
          type="number"
          inputMode="numeric"
          min="0"
          placeholder={t("Stock")}
          aria-label={t("Stock")}
          className="sm:w-24"
          required
        />
        <SubmitButton className="col-span-2 sm:w-auto" pendingLabel={t("Enviando…")}>
          {t("Agregar talla")}
        </SubmitButton>
      </form>
      <FormError message={state.error} />
    </div>
  );
}
