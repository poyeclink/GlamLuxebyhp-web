import Link from "next/link";
import { listVariantsWithStock, LOW_STOCK_THRESHOLD } from "@/server/services/inventory-service";
import { Badge } from "@/components/ui/Badge";

export default async function AdminInventoryPage() {
  const variants = await listVariantsWithStock();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Inventario</h1>
        <p className="text-sm text-muted-foreground">
          Stock por talla, ordenado de menor a mayor. Stock bajo: {LOW_STOCK_THRESHOLD} o menos.
        </p>
      </div>

      {variants.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay tallas registradas.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 font-medium">Producto</th>
              <th className="py-2 font-medium">Talla</th>
              <th className="py-2 font-medium">Stock</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.id} className="border-b border-border">
                <td className="py-3 text-foreground">
                  {variant.product.name}
                  {!variant.product.active && (
                    <span className="ml-2 text-xs text-muted-foreground">(inactivo)</span>
                  )}
                </td>
                <td className="py-3 text-muted-foreground">{variant.size}</td>
                <td className="py-3">
                  <Badge variant={variant.stock <= LOW_STOCK_THRESHOLD ? "destructive" : "secondary"}>
                    {variant.stock}
                  </Badge>
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/admin/inventario/${variant.id}`}
                    className="text-sm font-medium text-foreground hover:underline"
                  >
                    Ver historial
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
