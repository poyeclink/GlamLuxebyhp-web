"use client";

import { useActionState, useState } from "react";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { SelectField } from "@/components/ui/SelectField";
import { Checkbox } from "@/components/ui/Checkbox";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { VariantSelector } from "@/components/admin/VariantSelector";
import type { ProductActionState } from "@/server/actions/product-actions";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const initialState: ProductActionState = {};

type Category = { id: string; label: string };

type ProductDefaultValues = {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  wholesalePrice: number;
  individualPrice: number;
  boxed: boolean;
  hasVariants: boolean;
  active: boolean;
};

export function ProductForm({
  action,
  categories,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ProductActionState, formData: FormData) => Promise<ProductActionState>;
  categories: Category[];
  defaultValues?: ProductDefaultValues;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  // Al editar, el slug ya fue elegido antes: no se debe regenerar solo por tocar el nombre.
  const [slugTouched, setSlugTouched] = useState(defaultValues !== undefined);
  // Solo al crear: al editar, ProductImageUploader (debajo de este formulario)
  // ya gestiona las imágenes con el productId real — duplicar el input aquí
  // llevaría a dos formularios distintos subiendo imágenes del mismo producto.
  const isCreating = defaultValues === undefined;
  // Controlado (no defaultChecked) solo para poder mostrar/ocultar
  // VariantSelector en vivo — al editar, VariantManager ya cubre esto con el
  // productId real, así que ahí el checkbox sigue siendo informativo nada más
  // (ver nota en VariantManager/CLAUDE.md: no condiciona si se pueden cargar tallas).
  const [hasVariants, setHasVariants] = useState(defaultValues?.hasVariants ?? false);

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

      <SelectField
        label="Categoría"
        name="categoryId"
        defaultValue={defaultValues?.categoryId}
        required
      >
        <option value="" disabled>
          Selecciona una categoría
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </SelectField>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="description">
          Descripción
        </label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Precio mayorista"
          name="wholesalePrice"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          defaultValue={defaultValues?.wholesalePrice}
          required
        />
        <TextField
          label="Precio individual"
          name="individualPrice"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          defaultValue={defaultValues?.individualPrice}
          required
        />
      </div>

      <fieldset className="flex flex-col divide-y divide-border rounded-xl border border-border px-4 sm:py-1 sm:*:py-2">
        <legend className="sr-only">Opciones del producto</legend>
        <Checkbox label="Viene en caja" name="boxed" defaultChecked={defaultValues?.boxed} />
        <Checkbox
          label="Tiene variantes de talla"
          name="hasVariants"
          checked={hasVariants}
          onChange={(event) => setHasVariants(event.target.checked)}
        />
        <Checkbox
          label="Activo (visible en la tienda)"
          name="active"
          defaultChecked={defaultValues?.active ?? true}
        />
      </fieldset>

      {isCreating && hasVariants && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Tallas y stock</span>
          <VariantSelector />
        </div>
      )}

      {isCreating && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Imágenes (opcional)</span>
          <ImageDropzone name="images" />
          <p className="text-xs text-muted-foreground">La primera imagen será la principal.</p>
        </div>
      )}

      {/* Queda pegada justo encima de la barra de pestañas del admin móvil (4rem +
          safe area) y rebasa el padding de la tarjeta que envuelve al formulario
          (p-4 / sm:p-8 en las páginas de producto) para cubrir todo su ancho. */}
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 -mx-4 flex flex-col gap-3 border-t border-border bg-background/95 px-4 py-3 sm:-mx-8 sm:px-8 md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <FormError message={state.error} />
        <SubmitButton className="md:w-auto md:self-start">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
