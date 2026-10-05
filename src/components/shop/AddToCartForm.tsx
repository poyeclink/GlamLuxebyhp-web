"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { addToCartAction, type CartActionState } from "@/server/actions/cart-actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import { Label } from "@/components/ui/Label";
import { QuantityInput } from "@/components/ui/QuantityInput";

type VariantOption = {
  id: string;
  size: string;
  stock: number;
};

export type AddToCartCopy = {
  size: string;
  quantity: string;
  soldOut: string;
  add: string;
  added: string;
  viewCart: string;
  decrease: string;
  increase: string;
  pending: string;
};

const initialState: CartActionState = {};

export function AddToCartForm({
  productId,
  hasVariants,
  variants,
  copy,
}: {
  productId: string;
  hasVariants: boolean;
  variants: VariantOption[];
  copy: AddToCartCopy;
}) {
  const [state, formAction] = useActionState(addToCartAction.bind(null, productId), initialState);
  const soldOut = hasVariants && variants.length > 0 && variants.every((v) => v.stock === 0);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {hasVariants && variants.length > 0 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium text-foreground">{copy.size}</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <label key={variant.id} className="relative">
                <input
                  type="radio"
                  name="variantId"
                  value={variant.id}
                  disabled={variant.stock === 0}
                  required
                  className="peer sr-only"
                />
                <span className="flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors hover:border-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:text-muted-foreground peer-disabled:line-through peer-disabled:hover:border-border">
                  {variant.size}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="quantity">{copy.quantity}</Label>
        <QuantityInput
          name="quantity"
          defaultValue={1}
          min={1}
          className="h-12"
          decreaseLabel={copy.decrease}
          increaseLabel={copy.increase}
        />
      </div>

      <SubmitButton size="lg" disabled={soldOut} pendingLabel={copy.pending}>
        {soldOut ? copy.soldOut : copy.add}
      </SubmitButton>
      <FormError message={state.error} />
      {state.added && !state.error ? (
        <p className="flex items-center justify-between gap-3 rounded-md bg-accent-soft px-4 py-3 text-sm text-foreground">
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4 text-accent" />
            {copy.added}
          </span>
          <Link
            href="/carrito"
            className="font-semibold text-accent underline-offset-4 hover:underline"
          >
            {copy.viewCart}
          </Link>
        </p>
      ) : null}
    </form>
  );
}
