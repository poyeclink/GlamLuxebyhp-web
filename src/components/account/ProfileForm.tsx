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
}: {
  email: string;
  defaultValues: { name: string; whatsapp: string | null };
}) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Correo</span>
        <span className="text-sm text-muted-foreground">{email}</span>
      </div>
      <TextField label="Nombre" name="name" type="text" defaultValue={defaultValues.name} required />
      <TextField
        label="WhatsApp"
        name="whatsapp"
        type="tel"
        defaultValue={defaultValues.whatsapp ?? ""}
        placeholder="Opcional"
      />
      <FormError message={state.error} />
      {state.success && !state.error ? (
        <p className="text-sm text-muted-foreground">Datos actualizados.</p>
      ) : null}
      <SubmitButton className="sm:w-auto">Guardar cambios</SubmitButton>
    </form>
  );
}
