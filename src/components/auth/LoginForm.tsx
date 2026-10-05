"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthActionState } from "@/server/actions/auth-actions";
import { TextField } from "@/components/ui/TextField";
import { PasswordField } from "@/components/ui/PasswordField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

const initialState: AuthActionState = {};

export type LoginFormCopy = {
  email: string;
  password: string;
  showPassword: string;
  hidePassword: string;
  forgot: string;
  submit: string;
  pending: string;
  noAccount: string;
  register: string;
};

export function LoginForm({ copy }: { copy: LoginFormCopy }) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TextField label={copy.email} name="email" type="email" autoComplete="email" required />
      <PasswordField
        label={copy.password}
        name="password"
        autoComplete="current-password"
        showLabel={copy.showPassword}
        hideLabel={copy.hidePassword}
        required
      />
      <Link
        href="/recuperar"
        className="-my-2.5 w-fit self-end py-2.5 text-sm text-muted-foreground hover:text-accent"
      >
        {copy.forgot}
      </Link>
      <FormError message={state.error} />
      <SubmitButton size="lg" className="mt-1" pendingLabel={copy.pending}>
        {copy.submit}
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        {copy.noAccount}{" "}
        <Link href="/registro" className="font-medium text-accent hover:underline">
          {copy.register}
        </Link>
      </p>
    </form>
  );
}
