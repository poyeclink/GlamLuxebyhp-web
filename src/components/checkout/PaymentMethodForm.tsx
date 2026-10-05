"use client";

import { useActionState } from "react";
import { Radio } from "@/components/ui/Radio";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  selectCheckoutPaymentMethodAction,
  type CheckoutPaymentActionState,
} from "@/server/actions/checkout-actions";

const initialState: CheckoutPaymentActionState = {};

export function PaymentMethodForm({
  addressId,
  termsAcceptedAt,
  options,
  submitLabel,
  pendingLabel,
}: {
  addressId: string;
  termsAcceptedAt: string;
  options: { value: string; label: string }[];
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction] = useActionState(selectCheckoutPaymentMethodAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="addressId" value={addressId} />
      <input type="hidden" name="termsAcceptedAt" value={termsAcceptedAt} />

      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <Radio
            key={option.value}
            name="paymentMethod"
            value={option.value}
            label={option.label}
          />
        ))}
      </div>

      <FormError message={state.error} />
      <SubmitButton className="sm:w-auto" pendingLabel={pendingLabel}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
