"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";

export function SubmitButton({ children, ...props }: ComponentProps<"button">) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Enviando…" : children}
    </button>
  );
}
