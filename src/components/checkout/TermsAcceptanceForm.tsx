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

export function TermsAcceptanceForm({
  addressId,
  copy,
}: {
  addressId: string;
  copy: { label: string; submit: string; pending: string };
}) {
  const [state, formAction] = useActionState(acceptCheckoutTermsAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="addressId" value={addressId} />
      <Checkbox name="termsAccepted" label={copy.label} />
      <FormError message={state.error} />
      <SubmitButton className="sm:w-auto" pendingLabel={copy.pending}>
        {copy.submit}
      </SubmitButton>
    </form>
  );
}
