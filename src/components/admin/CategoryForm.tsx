"use client";

import { useActionState, useEffect, useState } from "react";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
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
  parents,
  submitLabel,
  onSuccess,
}: {
  action: (prevState: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;
  defaultValues?: { name: string; slug: string; parentId: string | null };
  parents: { id: string; name: string; slug: string }[] | null;
  submitLabel: string;
  onSuccess?: () => void;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [parentId, setParentId] = useState(defaultValues?.parentId ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  // Al editar, el slug ya fue elegido antes: no se debe regenerar solo por tocar el nombre.
  const [slugTouched, setSlugTouched] = useState(defaultValues !== undefined);

  // El formulario vive en un modal (categorías/envíos): sin redirect a una
  // página aparte, esto es lo que le avisa al modal que ya puede cerrarse.
  useEffect(() => {
    if (state.success) onSuccess?.();
  }, [state.success, onSuccess]);

  // Los slugs son únicos en toda la tabla: "Mujer" bajo Zapatos y bajo Ropa
  // chocarían, así que el de una subcategoría lleva el del padre delante.
  function suggestSlug(nextName: string, nextParentId: string) {
    if (slugTouched) return;
    const parentSlug = parents?.find((parent) => parent.id === nextParentId)?.slug;
    setSlug(slugify(parentSlug ? `${parentSlug} ${nextName}` : nextName));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label="Nombre"
        name="name"
        type="text"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          suggestSlug(event.target.value, parentId);
        }}
        required
      />
      {parents ? (
        <SelectField
          label="Categoría principal"
          name="parentId"
          value={parentId}
          onChange={(event) => {
            setParentId(event.target.value);
            suggestSlug(name, event.target.value);
          }}
        >
          <option value="">Ninguna (es una categoría principal)</option>
          {parents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </SelectField>
      ) : (
        <p className="text-xs text-muted-foreground">
          Tiene subcategorías, así que se mantiene como categoría principal.
        </p>
      )}
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
