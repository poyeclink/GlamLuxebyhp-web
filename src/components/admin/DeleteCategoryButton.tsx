"use client";

import { useActionState } from "react";
import { deleteCategoryAction, type CategoryActionState } from "@/server/actions/category-actions";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

const initialState: CategoryActionState = {};

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const t = useAdminT();
  const [state, formAction] = useActionState(
    deleteCategoryAction.bind(null, categoryId),
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <Button type="submit" variant="ghost" size="sm">
        {t("Eliminar")}
      </Button>
      <FormError message={state.error} />
    </form>
  );
}
