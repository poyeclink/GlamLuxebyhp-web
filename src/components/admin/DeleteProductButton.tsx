"use client";

import { useActionState } from "react";
import { deleteProductAction, type ProductActionState } from "@/server/actions/product-actions";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";

const initialState: ProductActionState = {};

export function DeleteProductButton({ productId }: { productId: string }) {
  const t = useAdminT();
  const [state, formAction] = useActionState(
    deleteProductAction.bind(null, productId),
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        onClick={(event) => {
          // Borra también las fotos de R2: un toque accidental en el teléfono no debe bastar.
          if (
            !confirm(
              t(
                "¿Eliminar este producto? También se borran sus fotos y tallas. Esta acción no se puede deshacer.",
              ),
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        {t("Eliminar")}
      </Button>
      <FormError message={state.error} />
    </form>
  );
}
