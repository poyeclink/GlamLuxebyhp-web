import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "@/server/actions/product-actions";
import { listCategories } from "@/server/services/category-service";

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        back={{ href: "/admin/productos", label: "Volver a productos" }}
        eyebrow="Catálogo"
        title="Nuevo producto"
        description="Completa los datos, sube las fotos y, si aplica, las tallas con su stock."
      />
      {categories.length === 0 ? (
        <p className="text-muted-foreground">
          Primero crea una categoría desde{" "}
          <Link href="/admin/categorias" className="underline">
            Categorías
          </Link>
          .
        </p>
      ) : (
        <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
          <ProductForm
            action={createProductAction}
            categories={categories}
            submitLabel="Crear producto"
          />
        </div>
      )}
    </div>
  );
}
