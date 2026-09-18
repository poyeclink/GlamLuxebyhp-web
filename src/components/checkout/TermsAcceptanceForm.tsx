"use client";

import { useActionState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  acceptCheckoutTermsAction,
  type CheckoutTermsActionState,
} from "@/server/actions/checkout-actions";

const initialState: CheckoutTermsActionState = {};

export function TermsAcceptanceForm({ addressId }: { addressId: string }) {
  const [state, formAction] = useActionState(acceptCheckoutTermsAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="addressId" value={addressId} />
      <Checkbox name="termsAccepted" label="Acepto los términos y condiciones de venta." />
      <FormError message={state.error} />
      <SubmitButton className="sm:w-auto">Continuar</SubmitButton>
    </form>
  );
}
