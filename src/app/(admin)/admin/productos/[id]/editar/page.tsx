import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { VariantManager } from "@/components/admin/VariantManager";
import { getProduct } from "@/server/services/product-service";
import { updateProductAction } from "@/server/actions/product-actions";
import { listCategories } from "@/server/services/category-service";
import { r2PublicUrl } from "@/lib/r2";

export default async function EditProductPage({
  params,
}: PageProps<"/admin/productos/[id]/editar">) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProduct(id), listCategories()]);
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
        back={{ href: "/admin/productos", label: "Volver a productos" }}
        eyebrow="Editar producto"
        title={product.name}
      />

      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-4 sm:p-8">
        <h2 className="font-display text-2xl text-foreground">Información</h2>
        <ProductForm
          action={updateProductAction.bind(null, id)}
          categories={categories}
          defaultValues={{
            name: product.name,
            slug: product.slug,
            categoryId: product.categoryId,
            description: product.description,
            wholesalePrice: Number(product.wholesalePrice),
            individualPrice: Number(product.individualPrice),
            boxed: product.boxed,
            hasVariants: product.hasVariants,
            active: product.active,
          }}
          submitLabel="Guardar cambios"
        />
      </section>

      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-4 sm:p-8">
        <h2 className="font-display text-2xl text-foreground">Imágenes</h2>
        <ProductImageUploader productId={product.id} images={images} />
      </section>

      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-4 sm:p-8">
        <h2 className="font-display text-2xl text-foreground">Tallas y stock</h2>
        <VariantManager productId={product.id} variants={product.variants} />
      </section>
    </div>
  );
}
