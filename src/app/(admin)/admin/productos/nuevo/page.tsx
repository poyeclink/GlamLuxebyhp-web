import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "@/server/actions/product-actions";
import { listCategories } from "@/server/services/category-service";
import { getAdminT } from "@/lib/i18n";

export default async function NewProductPage() {
  const [categories, t] = await Promise.all([listCategories(), getAdminT()]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        back={{ href: "/admin/productos", label: t("Volver a productos") }}
        eyebrow={t("Catálogo")}
        title={t("Nuevo producto")}
        description={t("Completa los datos, sube las fotos y, si aplica, las tallas.")}
      />
      {categories.length === 0 ? (
        <p className="text-muted-foreground">
          {t("Primero crea una categoría desde")}{" "}
          <Link href="/admin/categorias" className="underline">
            {t("Categorías")}
          </Link>
          .
        </p>
      ) : (
        <div className="rounded-2xl border border-border bg-background p-4 sm:p-8">
          <ProductForm
            action={createProductAction}
            categories={categories}
            submitLabel={t("Crear producto")}
          />
        </div>
      )}
    </div>
  );
}
