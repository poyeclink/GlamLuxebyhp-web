"use client";

import { useActionState, useState } from "react";
import {
  removeAvatarAction,
  updateAvatarAction,
  type ProfileActionState,
} from "@/server/actions/profile-actions";
import { AvatarInput, type AvatarInputCopy } from "@/components/account/AvatarInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

const initialState: ProfileActionState = {};

export function AvatarForm({
  avatarUrl,
  fallback,
  copy,
}: {
  avatarUrl: string | null;
  fallback: string;
  copy: AvatarInputCopy & { save: string; remove: string; saved: string; pending: string };
}) {
  const [dirty, setDirty] = useState(false);
  // React vacía el input de archivo al terminar la acción: tras un error se
  // remonta el selector para no mostrar una vista previa que ya no se enviaría.
  const [attempt, setAttempt] = useState(0);
  const [state, formAction] = useActionState(
    async (prev: ProfileActionState, formData: FormData) => {
      const result = await updateAvatarAction(prev, formData);
      setDirty(false);
      if (result.error) setAttempt((n) => n + 1);
      return result;
    },
    initialState,
  );
  const [removeState, removeAction] = useActionState(removeAvatarAction, initialState);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <AvatarInput
          key={`${avatarUrl}-${attempt}`}
          initialUrl={avatarUrl}
          fallback={fallback}
          copy={copy}
          onChange={() => setDirty(true)}
        />
        <FormError message={state.error ?? removeState.error} />
        {state.success && !dirty && <p className="text-sm text-accent">{copy.saved}</p>}
        {dirty && (
          <SubmitButton className="sm:w-auto sm:self-start" pendingLabel={copy.pending}>
            {copy.save}
          </SubmitButton>
        )}
      </form>
      {avatarUrl && !dirty && (
        <form action={removeAction}>
          <SubmitButton
            variant="ghost"
            size="sm"
            className="w-auto text-muted-foreground"
            pendingLabel={copy.pending}
          >
            {copy.remove}
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
