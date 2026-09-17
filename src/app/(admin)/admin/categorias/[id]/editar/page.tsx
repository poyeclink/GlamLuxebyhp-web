import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { getCategory } from "@/server/services/category-service";
import { updateCategoryAction } from "@/server/actions/category-actions";

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/categorias/[id]/editar">) {
  const { id } = await params;
  const category = await getCategory(id);
  if (!category) notFound();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Editar categoría</h1>
      <CategoryForm
        action={updateCategoryAction.bind(null, id)}
        defaultValues={{ name: category.name, slug: category.slug }}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
