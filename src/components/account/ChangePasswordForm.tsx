"use client";

import { useActionState } from "react";
import Link from "next/link";
import { changePasswordAction, type ProfileActionState } from "@/server/actions/profile-actions";
import { PasswordField } from "@/components/ui/PasswordField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

const initialState: ProfileActionState = {};

export function ChangePasswordForm({
  copy,
}: {
  copy: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    showPassword: string;
    hidePassword: string;
    forgot: string;
    passwordSaved: string;
    savePassword: string;
    pending: string;
  };
}) {
  const [state, formAction] = useActionState(changePasswordAction, initialState);
  const toggle = { showLabel: copy.showPassword, hideLabel: copy.hidePassword };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <PasswordField
        label={copy.currentPassword}
        name="currentPassword"
        autoComplete="current-password"
        required
        {...toggle}
      />
      <Link
        href="/recuperar"
        className="-my-2.5 w-fit py-2.5 text-sm text-muted-foreground hover:text-accent"
      >
        {copy.forgot}
      </Link>
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField
          label={copy.newPassword}
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          {...toggle}
        />
        <PasswordField
          label={copy.confirmPassword}
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          required
          {...toggle}
        />
      </div>
      <FormError message={state.error} />
      {state.success && !state.error ? (
        <p role="status" className="text-sm text-muted-foreground">
          {copy.passwordSaved}
        </p>
      ) : null}
      <SubmitButton className="sm:w-auto" pendingLabel={copy.pending}>
        {copy.savePassword}
      </SubmitButton>
    </form>
  );
}
