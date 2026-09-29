"use client";

import { useActionState } from "react";
import Image from "next/image";
import {
  removeCartItemAction,
  updateCartItemQuantityAction,
  type CartActionState,
} from "@/server/actions/cart-actions";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import { formatCurrency } from "@/lib/utils";

export type CartLineItem = {
  id: string;
  productName: string;
  variantSize: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string | null;
};

const initialState: CartActionState = {};

export function CartItemRow({ item }: { item: CartLineItem }) {
  const [state, formAction] = useActionState(
    updateCartItemQuantityAction.bind(null, item.id),
    initialState,
  );
  const [removeState, removeAction] = useActionState(
    removeCartItemAction.bind(null, item.id),
    initialState,
  );

  return (
    // Móvil: foto a la izquierda y el resto apilado a su lado; desde sm: una
    // sola fila (foto | datos | cantidad | total).
    <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-border py-5 sm:grid-cols-[6rem_minmax(0,1fr)_auto_6rem] sm:items-center sm:gap-x-6">
      <div className="relative row-span-3 aspect-[4/5] w-20 overflow-hidden rounded-xl bg-muted sm:row-span-1 sm:w-24">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-display text-lg leading-tight text-foreground">
          {item.productName}
        </span>
        {item.variantSize ? (
          <span className="text-sm text-muted-foreground">Talla: {item.variantSize}</span>
        ) : null}
        <span className="text-sm text-muted-foreground">{formatCurrency(item.unitPrice)} c/u</span>
        <FormError message={state.error} />
        <FormError message={removeState.error} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form action={formAction} className="flex items-center gap-2">
          <Input
            name="quantity"
            type="number"
            min="1"
            defaultValue={item.quantity}
            className="w-20"
            required
          />
          <SubmitButton variant="outline" size="sm" className="w-auto">
            Actualizar
          </SubmitButton>
        </form>
        <form action={removeAction}>
          <SubmitButton variant="ghost" size="sm" className="w-auto">
            Eliminar
          </SubmitButton>
        </form>
      </div>

      <span className="font-semibold text-foreground sm:text-right">
        {formatCurrency(item.lineTotal)}
      </span>
    </div>
  );
}
