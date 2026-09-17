"use client";

import { useActionState } from "react";
import { deleteAddressAction, type AddressActionState } from "@/server/actions/address-actions";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

const initialState: AddressActionState = {};

export function DeleteAddressButton({ addressId }: { addressId: string }) {
  const [state, formAction] = useActionState(
    deleteAddressAction.bind(null, addressId),
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
