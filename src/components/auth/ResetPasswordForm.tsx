"use client";

import { useActionState } from "react";
import { resetPasswordAction, type AuthActionState } from "@/server/actions/auth-actions";
import { PasswordField } from "@/components/ui/PasswordField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

const initialState: AuthActionState = {};

export type ResetPasswordFormCopy = {
  password: string;
  confirmPassword: string;
  showPassword: string;
  hidePassword: string;
  submit: string;
  pending: string;
};

export function ResetPasswordForm({ token, copy }: { token: string; copy: ResetPasswordFormCopy }) {
  const [state, formAction] = useActionState(resetPasswordAction.bind(null, token), initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <PasswordField
        label={copy.password}
        name="password"
        autoComplete="new-password"
        minLength={8}
        showLabel={copy.showPassword}
        hideLabel={copy.hidePassword}
        required
      />
      <PasswordField
        label={copy.confirmPassword}
        name="confirmPassword"
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
    </form>
  );
}
