"use client";

import { useActionState } from "react";
import { deleteProductAction, type ProductActionState } from "@/server/actions/product-actions";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

const initialState: ProductActionState = {};

export function DeleteProductButton({ productId }: { productId: string }) {
  const [state, formAction] = useActionState(
    deleteProductAction.bind(null, productId),
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <Button type="submit" variant="ghost" size="sm">
        Eliminar
      </Button>
      <FormError message={state.error} />
    </form>
  );
}
