"use client";

import { useActionState } from "react";
import Link from "next/link";
import { adminLoginAction, type AuthActionState } from "@/server/actions/auth-actions";
import { TextField } from "@/components/ui/TextField";
import { PasswordField } from "@/components/ui/PasswordField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";

const initialState: AuthActionState = {};

export function AdminLoginForm() {
  const [state, formAction] = useActionState(adminLoginAction, initialState);
  const t = useAdminT();

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TextField label={t("Correo")} name="email" type="email" autoComplete="email" required />
      <PasswordField
        label={t("Contraseña")}
        showLabel={t("Mostrar contraseña")}
        hideLabel={t("Ocultar contraseña")}
        name="password"
        autoComplete="current-password"
        required
      />
      <Link
        href="/recuperar?desde=admin"
        className="-my-2.5 w-fit self-end py-2.5 text-sm text-muted-foreground hover:text-accent"
      >
        {t("¿Olvidaste tu contraseña?")}
      </Link>
      <FormError message={state.error} />
      <SubmitButton size="lg" className="mt-1" pendingLabel={t("Enviando…")}>
        {t("Entrar")}
      </SubmitButton>
    </form>
  );
}
