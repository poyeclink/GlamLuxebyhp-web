import { notFound } from "next/navigation";
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
    <div className="mx-auto flex max-w-lg flex-col gap-10 px-4 py-16">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-foreground">Editar producto</h1>
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
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Imágenes</h2>
        <ProductImageUploader productId={product.id} images={images} />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Tallas y stock</h2>
        <VariantManager productId={product.id} variants={product.variants} />
      </div>
    </div>
  );
}
