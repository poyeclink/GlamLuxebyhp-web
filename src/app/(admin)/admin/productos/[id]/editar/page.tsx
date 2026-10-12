import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { VariantManager } from "@/components/admin/VariantManager";
import { getProduct } from "@/server/services/product-service";
import { updateProductAction } from "@/server/actions/product-actions";
import { listCategories } from "@/server/services/category-service";
import { r2PublicUrl } from "@/lib/r2";
import { getAdminT } from "@/lib/i18n";

export default async function EditProductPage({
  params,
}: PageProps<"/admin/productos/[id]/editar">) {
  const { id } = await params;
  const [product, categories, t] = await Promise.all([
    getProduct(id),
    listCategories(),
    getAdminT(),
  ]);
  if (!product) notFound();

  const images = product.images.map((image) => ({
    id: image.id,
    url: r2PublicUrl(image.key),
    alt: image.alt,
    isPrimary: image.isPrimary,
  }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        back={{ href: "/admin/productos", label: t("Volver a productos") }}
        eyebrow={t("Editar producto")}
        title={product.name}
      />

      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-4 sm:p-8">
        <h2 className="font-display text-2xl text-foreground">{t("Información")}</h2>
        <ProductForm
          action={updateProductAction.bind(null, id)}
          categories={categories}
          defaultValues={{
            name: product.name,
            slug: product.slug,
            categoryId: product.categoryId,
            description: product.description,
            individualPrice: Number(product.individualPrice),
            boxed: product.boxed,
            hasVariants: product.hasVariants,
            active: product.active,
            soldOut: product.soldOut,
          }}
          submitLabel={t("Guardar cambios")}
        />
      </section>

      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-4 sm:p-8">
        <h2 className="font-display text-2xl text-foreground">{t("Imágenes")}</h2>
        <ProductImageUploader productId={product.id} images={images} />
      </section>

      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-4 sm:p-8">
        <h2 className="font-display text-2xl text-foreground">{t("Tallas")}</h2>
        {product.hasVariants ? (
          <VariantManager
            productId={product.id}
            variants={product.variants.map(({ id, size, soldOut }) => ({ id, size, soldOut }))}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {t(
              "Este producto no maneja tallas. Para agregarlas, marca «Tiene variantes de talla» arriba y guarda los cambios.",
            )}
          </p>
        )}
      </section>
    </div>
  );
}
