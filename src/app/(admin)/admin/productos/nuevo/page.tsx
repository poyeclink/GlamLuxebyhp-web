import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "@/server/actions/product-actions";
import { listCategories } from "@/server/services/category-service";

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Nuevo producto</h1>
      {categories.length === 0 ? (
        <p className="text-muted-foreground">
          Primero crea una categoría desde{" "}
          <Link href="/admin/categorias" className="underline">
            Categorías
          </Link>
          .
        </p>
      ) : (
        <ProductForm
          action={createProductAction}
          categories={categories}
          submitLabel="Crear producto"
        />
      )}
    </div>
  );
}
