import type { PricingTier } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// Sin tarifa configurada para la cantidad/tier dados = "se coordina aparte"
// (así es como hoy se representa el envío mayorista: no hay fila para ese tier).
export async function resolveShippingCost(tier: PricingTier, quantity: number) {
  const rate = await prisma.shippingRate.findFirst({
    where: {
      tier,
      minQuantity: { lte: quantity },
      OR: [{ maxQuantity: null }, { maxQuantity: { gte: quantity } }],
    },
    orderBy: { minQuantity: "desc" },
  });
  return rate ? Number(rate.price) : null;
}
