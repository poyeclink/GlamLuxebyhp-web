"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import {
  requestPasswordResetAction,
  type PasswordResetRequestState,
} from "@/server/actions/auth-actions";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

const initialState: PasswordResetRequestState = {};

export type ForgotPasswordFormCopy = {
  email: string;
  submit: string;
  pending: string;
  sentTitle: string;
  sentText: string;
  back: string;
};

export function ForgotPasswordForm({
  copy,
  backHref,
}: {
  copy: ForgotPasswordFormCopy;
  backHref: string;
}) {
  const [state, formAction] = useActionState(requestPasswordResetAction, initialState);

  if (state.sent) {
    return (
      <div role="status" className="flex flex-col gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-inverse text-inverse-accent">
          <MailCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="font-display text-2xl text-foreground">{copy.sentTitle}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{copy.sentText}</p>
        <Link href={backHref} className="text-sm font-medium text-accent hover:underline">
          {copy.back}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TextField label={copy.email} name="email" type="email" autoComplete="email" required />
      <FormError message={state.error} />
      <SubmitButton size="lg" className="mt-1" pendingLabel={copy.pending}>
        {copy.submit}
      </SubmitButton>
      <Link href={backHref} className="text-center text-sm font-medium text-accent hover:underline">
        {copy.back}
      </Link>
    </form>
  );
}
