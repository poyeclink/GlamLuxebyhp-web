"use client";

import { useActionState, useState } from "react";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import type { CategoryActionState } from "@/server/actions/category-actions";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const initialState: CategoryActionState = {};

export function CategoryForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;
  defaultValues?: { name: string; slug: string };
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  // Al editar, el slug ya fue elegido antes: no se debe regenerar solo por tocar el nombre.
  const [slugTouched, setSlugTouched] = useState(defaultValues !== undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label="Nombre"
        name="name"
        type="text"
        defaultValue={defaultValues?.name}
        onChange={(event) => {
          if (!slugTouched) setSlug(slugify(event.target.value));
        }}
        required
      />
      <TextField
        label="Slug"
        name="slug"
        type="text"
        value={slug}
        onChange={(event) => {
          setSlugTouched(true);
          setSlug(event.target.value);
        }}
        required
      />
      <FormError message={state.error} />
      <SubmitButton className="sm:w-auto">{submitLabel}</SubmitButton>
    </form>
  );
}
