"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { Textarea } from "@/components/ui/Textarea";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import type { AddressActionState } from "@/server/actions/address-actions";
import { ADDRESS_FORM_COPY, type AddressFormCopy } from "@/components/account/address-form-copy";

const initialState: AddressActionState = {};

type AddressDefaultValues = {
  fullName: string;
  whatsapp: string;
  email: string;
  addressLine: string;
  addressType: "casa" | "apartamento";
  city: string;
  state: string;
  zip: string;
  notes: string | null;
};

export function AddressForm({
  action,
  defaultValues,
  submitLabel,
  copy = ADDRESS_FORM_COPY,
}: {
  action: (prevState: AddressActionState, formData: FormData) => Promise<AddressActionState>;
  defaultValues?: AddressDefaultValues;
  submitLabel: string;
  copy?: AddressFormCopy;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label={copy.fullName}
        name="fullName"
        type="text"
        defaultValue={defaultValues?.fullName}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label={copy.whatsapp}
          name="whatsapp"
          type="tel"
          defaultValue={defaultValues?.whatsapp}
          required
        />
        <TextField
          label={copy.email}
          name="email"
          type="email"
          defaultValue={defaultValues?.email}
          required
        />
      </div>

      <TextField
        label={copy.addressLine}
        name="addressLine"
        type="text"
        defaultValue={defaultValues?.addressLine}
        required
      />

      <SelectField
        label={copy.addressType}
        name="addressType"
        defaultValue={defaultValues?.addressType ?? "casa"}
        required
      >
        <option value="casa">{copy.house}</option>
        <option value="apartamento">{copy.apartment}</option>
      </SelectField>

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label={copy.city}
          name="city"
          type="text"
          defaultValue={defaultValues?.city}
          required
        />
        <TextField
          label={copy.state}
          name="state"
          type="text"
          defaultValue={defaultValues?.state}
          required
        />
        <TextField
          label={copy.zip}
          name="zip"
          type="text"
          defaultValue={defaultValues?.zip}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="notes">
          {copy.notes}
        </label>
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes ?? ""} />
      </div>

      <FormError message={state.error} />
      <SubmitButton className="sm:w-auto" pendingLabel={copy.pending}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
