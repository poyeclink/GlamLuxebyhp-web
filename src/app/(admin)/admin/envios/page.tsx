import { listShippingRates } from "@/server/services/shipping-service";
import { ShippingRatesManager } from "@/components/admin/ShippingRatesManager";

export default async function AdminShippingRatesPage() {
  const rates = await listShippingRates();

  // Decimal de Prisma no es serializable hacia un Client Component — se
  // convierte a number acá, mismo cuidado que toProductCardItem/ProductForm.
  const items = rates.map((rate) => ({
    id: rate.id,
    tier: rate.tier,
    minQuantity: rate.minQuantity,
    maxQuantity: rate.maxQuantity,
    price: Number(rate.price),
  }));

  return <ShippingRatesManager rates={items} />;
}
