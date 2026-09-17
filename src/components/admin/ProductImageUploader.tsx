"use client";

import { useActionState } from "react";
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
import { SubmitButton } from "@/components/ui/SubmitButton";

export type ProductImageItem = {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
};

const initialState: ProductImageActionState = {};
const FILE_INPUT_PROPS = {
  type: "file" as const,
  name: "file",
  accept: "image/jpeg,image/png,image/webp",
};

function ProductImageCard({ productId, image }: { productId: string; image: ProductImageItem }) {
  const [state, formAction] = useActionState(
    replaceProductImageAction.bind(null, image.id, productId),
    initialState,
  );

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-2">
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        <Image src={image.url} alt={image.alt ?? ""} fill className="object-cover" />
      </div>

      {image.isPrimary ? (
        <div className="text-center">
          <Badge variant="secondary">Principal</Badge>
        </div>
      ) : (
        <form action={setPrimaryProductImageAction.bind(null, image.id, productId)}>
          <Button type="submit" variant="outline" size="sm" className="w-full">
            Marcar como principal
          </Button>
        </form>
      )}

      <form action={formAction} className="flex flex-col gap-1">
        <input {...FILE_INPUT_PROPS} className="text-xs" />
        <SubmitButton variant="outline" size="sm">
          Reemplazar
        </SubmitButton>
        <FormError message={state.error} />
      </form>

      <form action={deleteProductImageAction.bind(null, image.id, productId)}>
        <Button type="submit" variant="ghost" size="sm" className="w-full">
          Eliminar
        </Button>
      </form>
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
  const [state, formAction] = useActionState(
    uploadProductImageAction.bind(null, productId),
    initialState,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((image) => (
          <ProductImageCard key={image.id} productId={productId} image={image} />
        ))}
      </div>

      <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <input {...FILE_INPUT_PROPS} required className="text-sm" />
        <SubmitButton className="sm:w-auto">Subir imagen</SubmitButton>
      </form>
      <FormError message={state.error} />
    </div>
  );
}
