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

export type VariantItem = {
  id: string;
  size: string;
  stock: number;
};

const initialState: VariantActionState = {};

function VariantRow({ productId, variant }: { productId: string; variant: VariantItem }) {
  const [state, formAction] = useActionState(
    updateVariantAction.bind(null, variant.id, productId),
    initialState,
  );

  return (
    <div className="flex flex-col gap-1 border-b border-border py-2">
      <div className="flex items-center gap-2">
        <form action={formAction} className="flex items-center gap-2">
          <Input name="size" defaultValue={variant.size} className="w-20" required />
          <Input
            name="stock"
            type="number"
            min="0"
            defaultValue={variant.stock}
            className="w-24"
            required
          />
          <SubmitButton variant="outline" size="sm" className="w-auto">
            Guardar
          </SubmitButton>
        </form>
        <form action={deleteVariantAction.bind(null, variant.id, productId)}>
          <Button type="submit" variant="ghost" size="sm">
            Eliminar
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
  const [state, formAction] = useActionState(
    createVariantAction.bind(null, productId),
    initialState,
  );

  return (
    <div className="flex flex-col gap-2">
      {variants.map((variant) => (
        <VariantRow key={variant.id} productId={productId} variant={variant} />
      ))}

      <form action={formAction} className="flex items-center gap-2 pt-2">
        <Input name="size" placeholder="Talla" className="w-20" required />
        <Input name="stock" type="number" min="0" placeholder="Stock" className="w-24" required />
        <SubmitButton className="w-auto">Agregar talla</SubmitButton>
      </form>
      <FormError message={state.error} />
    </div>
  );
}
