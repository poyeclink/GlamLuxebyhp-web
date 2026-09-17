import { CategoryForm } from "@/components/admin/CategoryForm";
import { createCategoryAction } from "@/server/actions/category-actions";

export default function NewCategoryPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Nueva categoría</h1>
      <CategoryForm action={createCategoryAction} submitLabel="Crear categoría" />
    </div>
  );
}
