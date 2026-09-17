import Link from "next/link";
import { listProducts } from "@/server/services/product-service";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default async function AdminProductsPage() {
  const products = await listProducts();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button>Nuevo producto</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay productos.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 font-medium">Nombre</th>
              <th className="py-2 font-medium">Categoría</th>
              <th className="py-2 font-medium">Mayorista</th>
              <th className="py-2 font-medium">Estado</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border">
                <td className="py-3 text-foreground">{product.name}</td>
                <td className="py-3 text-muted-foreground">{product.category.name}</td>
                <td className="py-3 text-muted-foreground">
                  {currencyFormatter.format(Number(product.wholesalePrice))}
                </td>
                <td className="py-3">
                  {product.active ? (
                    <Badge variant="secondary">Activo</Badge>
                  ) : (
                    <Badge variant="outline">Inactivo</Badge>
                  )}
                </td>
                <td className="py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/productos/${product.id}/editar`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <DeleteProductButton productId={product.id} />
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
