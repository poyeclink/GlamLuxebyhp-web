"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { Textarea } from "@/components/ui/Textarea";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import type { AddressActionState } from "@/server/actions/address-actions";

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
}: {
  action: (prevState: AddressActionState, formData: FormData) => Promise<AddressActionState>;
  defaultValues?: AddressDefaultValues;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label="Nombre completo"
        name="fullName"
        type="text"
        defaultValue={defaultValues?.fullName}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="WhatsApp"
          name="whatsapp"
          type="tel"
          defaultValue={defaultValues?.whatsapp}
          required
        />
        <TextField
          label="Correo"
          name="email"
          type="email"
          defaultValue={defaultValues?.email}
          required
        />
      </div>

      <TextField
        label="Dirección"
        name="addressLine"
        type="text"
        defaultValue={defaultValues?.addressLine}
        required
      />

      <SelectField
        label="Tipo"
        name="addressType"
        defaultValue={defaultValues?.addressType ?? "casa"}
        required
      >
        <option value="casa">Casa</option>
        <option value="apartamento">Apartamento</option>
      </SelectField>

      <div className="grid grid-cols-3 gap-4">
        <TextField
          label="Ciudad"
          name="city"
          type="text"
          defaultValue={defaultValues?.city}
          required
        />
        <TextField
          label="Estado"
          name="state"
          type="text"
          defaultValue={defaultValues?.state}
          required
        />
        <TextField
          label="Código postal"
          name="zip"
          type="text"
          defaultValue={defaultValues?.zip}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="notes">
          Notas (opcional)
        </label>
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes ?? ""} />
      </div>

      <FormError message={state.error} />
      <SubmitButton className="sm:w-auto">{submitLabel}</SubmitButton>
    </form>
  );
}
