"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthActionState } from "@/server/actions/auth-actions";
import { TextField } from "@/components/ui/TextField";
import { PasswordField } from "@/components/ui/PasswordField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import { AvatarInput } from "@/components/account/AvatarInput";

const initialState: AuthActionState = {};

export type RegisterFormCopy = {
  photo: string;
  choose: string;
  change: string;
  hint: string;
  name: string;
  email: string;
  password: string;
  showPassword: string;
  hidePassword: string;
  submit: string;
  pending: string;
  hasAccount: string;
  login: string;
};

export function RegisterForm({ copy }: { copy: RegisterFormCopy }) {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-foreground">{copy.photo}</legend>
        <AvatarInput fallback="" copy={copy} />
      </fieldset>
      <TextField label={copy.name} name="name" type="text" autoComplete="name" required />
      <TextField label={copy.email} name="email" type="email" autoComplete="email" required />
      <PasswordField
        label={copy.password}
        name="password"
        autoComplete="new-password"
        minLength={8}
        showLabel={copy.showPassword}
        hideLabel={copy.hidePassword}
        required
      />
      <FormError message={state.error} />
      <SubmitButton size="lg" className="mt-1" pendingLabel={copy.pending}>
        {copy.submit}
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        {copy.hasAccount}{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          {copy.login}
        </Link>
      </p>
    </form>
  );
}
