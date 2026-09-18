"use client";

import { useActionState } from "react";
import {
  deleteShippingRateAction,
  type ShippingActionState,
} from "@/server/actions/shipping-actions";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

const initialState: ShippingActionState = {};

export function DeleteShippingRateButton({ id }: { id: string }) {
  const [state, formAction] = useActionState(deleteShippingRateAction.bind(null, id), initialState);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <Button type="submit" variant="ghost" size="sm">
        Eliminar
      </Button>
      <FormError message={state.error} />
    </form>
  );
}
