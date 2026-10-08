"use client";

import { useActionState } from "react";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  confirmCheckoutOrderAction,
  type ConfirmOrderActionState,
} from "@/server/actions/checkout-actions";

const initialState: ConfirmOrderActionState = {};

export function ConfirmOrderForm({
  addressId,
  termsAcceptedAt,
  submitLabel,
  pendingLabel,
}: {
  addressId: string;
  termsAcceptedAt: string;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction] = useActionState(confirmCheckoutOrderAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="addressId" value={addressId} />
      <input type="hidden" name="termsAcceptedAt" value={termsAcceptedAt} />
      <FormError message={state.error} />
      <SubmitButton className="sm:w-auto" pendingLabel={pendingLabel}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
