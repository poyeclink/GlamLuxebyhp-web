"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthActionState } from "@/server/actions/auth-actions";
import { TextField } from "@/components/ui/TextField";
import { PasswordField } from "@/components/ui/PasswordField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TextField label="Nombre" name="name" type="text" autoComplete="name" required />
      <TextField label="Correo" name="email" type="email" autoComplete="email" required />
      <PasswordField
        label="Contraseña"
        name="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <FormError message={state.error} />
      <SubmitButton size="lg" className="mt-1">
        Crear cuenta
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
