"use client";

import { useActionState } from "react";
import { addToCartAction, type CartActionState } from "@/server/actions/cart-actions";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

type VariantOption = {
  id: string;
  size: string;
  stock: number;
};

const initialState: CartActionState = {};

export function AddToCartForm({
  productId,
  hasVariants,
  variants,
}: {
  productId: string;
  hasVariants: boolean;
  variants: VariantOption[];
}) {
  const [state, formAction] = useActionState(addToCartAction.bind(null, productId), initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {hasVariants && variants.length > 0 ? (
        <SelectField label="Talla" name="variantId" defaultValue="" required>
          <option value="" disabled>
            Selecciona una talla
          </option>
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id} disabled={variant.stock === 0}>
              {variant.size}
              {variant.stock === 0 ? " (agotado)" : ""}
            </option>
          ))}
        </SelectField>
      ) : null}

      <TextField
        label="Cantidad"
        name="quantity"
        type="number"
        min="1"
        defaultValue="1"
        className="w-24"
        required
      />

      <SubmitButton className="w-full sm:w-auto">Agregar al carrito</SubmitButton>
      <FormError message={state.error} />
    </form>
  );
}
