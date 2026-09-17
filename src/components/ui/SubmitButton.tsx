"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function SubmitButton({ className, children, ...props }: ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} type="submit" loading={pending} className={cn("w-full", className)}>
      {pending ? "Enviando…" : children}
    </Button>
  );
}
