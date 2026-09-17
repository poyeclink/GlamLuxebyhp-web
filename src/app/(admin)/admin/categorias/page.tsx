import Link from "next/link";
import { listCategories } from "@/server/services/category-service";
import { Button } from "@/components/ui/Button";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Categorías</h1>
        <Link href="/admin/categorias/nueva">
          <Button>Nueva categoría</Button>
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay categorías.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 font-medium">Nombre</th>
              <th className="py-2 font-medium">Slug</th>
              <th className="py-2 font-medium">Productos</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-border">
                <td className="py-3 text-foreground">{category.name}</td>
                <td className="py-3 text-muted-foreground">{category.slug}</td>
                <td className="py-3 text-muted-foreground">{category._count.products}</td>
                <td className="py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/categorias/${category.id}/editar`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <DeleteCategoryButton categoryId={category.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
