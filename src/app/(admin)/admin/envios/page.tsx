import Link from "next/link";
import { listShippingRates } from "@/server/services/shipping-service";
import { Button } from "@/components/ui/Button";
import { DeleteShippingRateButton } from "@/components/admin/DeleteShippingRateButton";
import { formatCurrency } from "@/lib/utils";

export default async function AdminShippingRatesPage() {
  const rates = await listShippingRates();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Tarifas de envío</h1>
        <Link href="/admin/envios/nueva">
          <Button>Nueva tarifa</Button>
        </Link>
      </div>

      {rates.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay tarifas configuradas.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 font-medium">Tier</th>
              <th className="py-2 font-medium">Cantidad</th>
              <th className="py-2 font-medium">Precio</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate.id} className="border-b border-border">
                <td className="py-3 text-foreground">{rate.tier}</td>
                <td className="py-3 text-muted-foreground">
                  {rate.minQuantity}
                  {rate.maxQuantity === null ? "+" : `–${rate.maxQuantity}`}
                </td>
                <td className="py-3 text-foreground">{formatCurrency(Number(rate.price))}</td>
                <td className="py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/envios/${rate.id}/editar`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <DeleteShippingRateButton id={rate.id} />
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
