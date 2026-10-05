"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileActionState } from "@/server/actions/profile-actions";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

const initialState: ProfileActionState = {};

export function ProfileForm({
  email,
  defaultValues,
  copy,
}: {
  email: string;
  defaultValues: { name: string; whatsapp: string | null };
  copy: {
    email: string;
    name: string;
    optional: string;
    saved: string;
    submit: string;
    pending: string;
  };
}) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">{copy.email}</span>
        <span className="text-sm text-muted-foreground">{email}</span>
      </div>
      <TextField
        label={copy.name}
        name="name"
        type="text"
        defaultValue={defaultValues.name}
        required
      />
      <TextField
        label="WhatsApp"
        name="whatsapp"
        type="tel"
        defaultValue={defaultValues.whatsapp ?? ""}
        placeholder={copy.optional}
      />
      <FormError message={state.error} />
      {state.success && !state.error ? (
        <p className="text-sm text-muted-foreground">{copy.saved}</p>
      ) : null}
      <SubmitButton className="sm:w-auto" pendingLabel={copy.pending}>
        {copy.submit}
      </SubmitButton>
    </form>
  );
}
