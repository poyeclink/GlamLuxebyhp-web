"use client";

import { useActionState } from "react";
import { adminLoginAction, type AuthActionState } from "@/server/actions/auth-actions";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

const initialState: AuthActionState = {};

export function AdminLoginForm() {
  const [state, formAction] = useActionState(adminLoginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField label="Correo" name="email" type="email" autoComplete="email" required />
      <TextField
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <FormError message={state.error} />
      <SubmitButton>Entrar</SubmitButton>
    </form>
  );
}
