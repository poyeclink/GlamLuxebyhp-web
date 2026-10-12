"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  deleteProductImageAction,
  replaceProductImageAction,
  setPrimaryProductImageAction,
  uploadProductImageAction,
  type ProductImageActionState,
} from "@/server/actions/product-image-actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { cn } from "@/lib/utils";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";
import {
  IMAGE_NOT_OPTIMIZED,
  IMAGE_TOO_LARGE,
  MAX_IMAGE_BYTES,
  PRODUCT_PHOTO_MAX_SIDE,
  PRODUCT_UPLOAD_BUDGET_BYTES,
  shrinkImage,
} from "@/lib/shrink-image";

export type ProductImageItem = {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
};

const initialState: ProductImageActionState = {};

// Elegir el archivo ya envía el formulario: en el teléfono, "elegir" y luego
// buscar un segundo botón "Subir" era un paso de más.
function FilePickerInput({ onError }: { onError: (message: string | null) => void }) {
  const t = useAdminT();
  return (
    <input
      type="file"
      name="file"
      accept="image/jpeg,image/png,image/webp"
      className="sr-only"
      onChange={async (event) => {
        const input = event.currentTarget;
        const file = input.files?.[0];
        if (!file) return;
        const small =
          file.size > MAX_IMAGE_BYTES
            ? null
            : await shrinkImage(file, PRODUCT_PHOTO_MAX_SIDE, PRODUCT_UPLOAD_BUDGET_BYTES);
        if (!small || small.size > PRODUCT_UPLOAD_BUDGET_BYTES) {
          input.value = "";
          onError(t(small ? IMAGE_NOT_OPTIMIZED : IMAGE_TOO_LARGE));
          return;
        }
        onError(null);
        const transfer = new DataTransfer();
        transfer.items.add(small);
        input.files = transfer.files;
        input.form?.requestSubmit();
      }}
    />
  );
}

function ProductImageCard({ productId, image }: { productId: string; image: ProductImageItem }) {
  const t = useAdminT();
  const [state, formAction, pending] = useActionState(
    replaceProductImageAction.bind(null, image.id, productId),
    initialState,
  );
  const [clientError, setClientError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-1.5 sm:p-2">
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        <Image
          src={image.url}
          alt={image.alt ?? ""}
          fill
          sizes="(min-width: 768px) 12rem, (min-width: 640px) 33vw, 50vw"
          className={cn("object-cover transition-opacity", pending && "opacity-50")}
        />
        {image.isPrimary && <Badge className="absolute left-1.5 top-1.5">{t("Principal")}</Badge>}
      </div>

      {!image.isPrimary && (
        <form action={setPrimaryProductImageAction.bind(null, image.id, productId)}>
          <Button type="submit" variant="outline" size="sm" className="w-full">
            {t("Hacer principal")}
          </Button>
        </form>
      )}

      <form action={formAction}>
        <label
          className={cn(
            "flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-input text-sm font-medium transition-colors hover:border-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring sm:h-8",
            pending && "pointer-events-none opacity-60",
          )}
        >
          <FilePickerInput onError={setClientError} />
          {pending ? t("Subiendo…") : t("Reemplazar")}
        </label>
      </form>

      <form action={deleteProductImageAction.bind(null, image.id, productId)}>
        <Button type="submit" variant="ghost" size="sm" className="w-full text-destructive">
          {t("Eliminar")}
        </Button>
      </form>

      <FormError message={clientError ?? state.error} />
    </div>
  );
}

export function ProductImageUploader({
  productId,
  images,
}: {
  productId: string;
  images: ProductImageItem[];
}) {
  const t = useAdminT();
  const [state, formAction, pending] = useActionState(
    uploadProductImageAction.bind(null, productId),
    initialState,
  );
  const [clientError, setClientError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
          {images.map((image) => (
            <ProductImageCard key={image.id} productId={productId} image={image} />
          ))}
        </div>
      )}

      <form action={formAction}>
        <label
          className={cn(
            "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input px-4 py-6 text-center transition-colors hover:border-ring hover:bg-muted/50 active:bg-muted/60 has-focus-visible:border-ring [-webkit-tap-highlight-color:transparent]",
            pending && "pointer-events-none opacity-60",
          )}
        >
          <FilePickerInput onError={setClientError} />
          <span
            className="material-symbols-outlined flex h-12 w-12 items-center justify-center rounded-full bg-muted text-[26px] text-foreground"
            aria-hidden="true"
          >
            {pending ? "progress_activity" : "add_photo_alternate"}
          </span>
          <span className="text-base font-medium text-foreground sm:text-sm">
            {pending ? t("Subiendo foto…") : t("Agregar foto")}
          </span>
          <span className="text-xs text-muted-foreground">
            {t("Desde la galería o la cámara · JPEG, PNG o WEBP. Se optimizan automáticamente.")}
          </span>
        </label>
      </form>
      <FormError message={clientError ?? state.error} />
    </div>
  );
}
