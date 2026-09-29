"use client";

import { useActionState } from "react";
import { adminLoginAction, type AuthActionState } from "@/server/actions/auth-actions";
import { TextField } from "@/components/ui/TextField";
import { PasswordField } from "@/components/ui/PasswordField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

const initialState: AuthActionState = {};

export function AdminLoginForm() {
  const [state, formAction] = useActionState(adminLoginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TextField label="Correo" name="email" type="email" autoComplete="email" required />
      <PasswordField label="Contraseña" name="password" autoComplete="current-password" required />
      <FormError message={state.error} />
      <SubmitButton size="lg" className="mt-1">
        Entrar
      </SubmitButton>
    </form>
  );
}
