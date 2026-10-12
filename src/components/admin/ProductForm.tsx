"use client";

import { useActionState, useState, useTransition } from "react";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { SelectField } from "@/components/ui/SelectField";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { VariantSelector } from "@/components/admin/VariantSelector";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";
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
  individualPrice: number;
  boxed: boolean;
  hasVariants: boolean;
  active: boolean;
  soldOut: boolean;
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
  const t = useAdminT();
  const [state, formAction, pending] = useActionState(action, initialState);
  const [, startTransition] = useTransition();
  // Oculta el aviso de "guardado" en cuanto se vuelve a editar algo.
  const [dirty, setDirty] = useState(false);
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  // Al editar, el slug ya fue elegido antes: no se debe regenerar solo por tocar el nombre.
  const [slugTouched, setSlugTouched] = useState(defaultValues !== undefined);
  // Solo al crear: al editar, ProductImageUploader (debajo de este formulario)
  // ya gestiona las imágenes con el productId real — duplicar el input aquí
  // llevaría a dos formularios distintos subiendo imágenes del mismo producto.
  const isCreating = defaultValues === undefined;
  // Controlado (no defaultChecked) solo para poder mostrar/ocultar
  // VariantSelector en vivo al crear; al editar, VariantManager aparece según
  // el valor ya guardado.
  const [hasVariants, setHasVariants] = useState(defaultValues?.hasVariants ?? false);

  return (
    // onSubmit + startTransition en vez de action={formAction}: con action,
    // React reinicia el formulario al terminar y, si el servidor devuelve un
    // error, se pierde lo que la administradora había escrito.
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setDirty(false);
        startTransition(() => formAction(data));
      }}
      onChange={() => setDirty(true)}
      className="flex flex-col gap-4"
    >
      <TextField
        label={t("Nombre")}
        name="name"
        type="text"
        defaultValue={defaultValues?.name}
        onChange={(event) => {
          if (!slugTouched) setSlug(slugify(event.target.value));
        }}
        required
      />
      <TextField
        label={t("Slug")}
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
        label={t("Categoría")}
        name="categoryId"
        // "" deja visible "Selecciona una categoría": sin esto el navegador
        // preselecciona la primera categoría y se puede guardar sin elegirla.
        defaultValue={defaultValues?.categoryId ?? ""}
        required
      >
        <option value="" disabled>
          {t("Selecciona una categoría")}
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </SelectField>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="description">
          {t("Descripción")}
        </label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description}
          required
        />
      </div>

      <TextField
        label={t("Precio")}
        name="individualPrice"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        defaultValue={defaultValues?.individualPrice}
        required
      />

      <fieldset className="flex flex-col divide-y divide-border rounded-xl border border-border px-4 sm:py-1 sm:*:py-2">
        <legend className="sr-only">{t("Opciones del producto")}</legend>
        <Checkbox label={t("Viene en caja")} name="boxed" defaultChecked={defaultValues?.boxed} />
        <Checkbox
          label={t("Tiene variantes de talla")}
          name="hasVariants"
          checked={hasVariants}
          onChange={(event) => setHasVariants(event.target.checked)}
        />
        {/* Con tallas, cada talla se marca agotada por separado. Se oculta en
            vez de desmontarse para no perder el valor guardado al enviar. */}
        <div className={hasVariants ? "hidden" : undefined}>
          <Checkbox
            label={t("Agotado (se ve en la tienda, pero no se puede comprar)")}
            name="soldOut"
            defaultChecked={defaultValues?.soldOut}
          />
        </div>
        <Checkbox
          label={t("Activo (visible en la tienda)")}
          name="active"
          defaultChecked={defaultValues?.active ?? true}
        />
      </fieldset>

      {isCreating && hasVariants && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">{t("Tallas")}</span>
          <VariantSelector />
        </div>
      )}

      {isCreating && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">{t("Imágenes (opcional)")}</span>
          <ImageDropzone name="images" />
          <p className="text-xs text-muted-foreground">{t("La primera imagen será la principal.")}</p>
        </div>
      )}

      {/* Queda pegada justo encima de la barra de pestañas del admin móvil (4rem +
          safe area) y rebasa el padding de la tarjeta que envuelve al formulario
          (p-4 / sm:p-8 en las páginas de producto) para cubrir todo su ancho. */}
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 -mx-4 flex flex-col gap-3 border-t border-border bg-background/95 px-4 py-3 sm:-mx-8 sm:px-8 md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <FormError message={state.error} />
        {state.success && !dirty && !pending && (
          <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-accent">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              check_circle
            </span>
            {t("Cambios guardados.")}
          </p>
        )}
        <Button type="submit" loading={pending} className="w-full md:w-auto md:self-start">
          {pending ? t("Enviando…") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
