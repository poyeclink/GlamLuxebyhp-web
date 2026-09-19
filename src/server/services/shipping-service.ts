import type { PricingTier } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/utils";

export class ShippingError extends Error {}

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

export function listShippingRates() {
  return prisma.shippingRate.findMany({ orderBy: [{ tier: "asc" }, { minQuantity: "asc" }] });
}

type ShippingRateInput = {
  tier: PricingTier;
  minQuantity: number;
  maxQuantity: number | null;
  price: number;
};

function assertValidRange(data: ShippingRateInput) {
  if (data.maxQuantity !== null && data.maxQuantity < data.minQuantity) {
    throw new ShippingError("La cantidad máxima no puede ser menor que la mínima.");
  }
}

// Rechaza no solo el (tier, minQuantity) exacto (eso ya lo protege el
// @@unique del schema, solo se pre-valida para un mensaje amigable, mismo
// patrón que assertSlugAvailable/assertSizeAvailable) sino cualquier tarifa
// del mismo tier cuyo rango [minQuantity, maxQuantity] se solape con el
// nuevo — sin esto, dos tarifas podían cubrir la misma cantidad y
// resolveShippingCost elegía una en silencio (la de minQuantity más alto)
// sin que el admin se enterara de que la otra quedó parcialmente inútil.
async function assertRangeAvailable(data: ShippingRateInput, excludeId?: string) {
  const candidates = await prisma.shippingRate.findMany({ where: { tier: data.tier } });
  const newMax = data.maxQuantity ?? Infinity;

  for (const existing of candidates) {
    if (existing.id === excludeId) continue;
    const existingMax = existing.maxQuantity ?? Infinity;
    const overlaps = data.minQuantity <= existingMax && existing.minQuantity <= newMax;
    if (overlaps) {
      throw new ShippingError(
        `Se solapa con la tarifa existente de "${data.tier}" (${existing.minQuantity}` +
          `${existing.maxQuantity === null ? "+" : `–${existing.maxQuantity}`}).`,
      );
    }
  }
}

export async function createShippingRate(data: ShippingRateInput) {
  assertValidRange(data);
  await assertRangeAvailable(data);
  return prisma.shippingRate.create({ data });
}

export async function updateShippingRate(id: string, data: ShippingRateInput) {
  if (!isUuid(id)) throw new ShippingError("Tarifa no encontrada.");
  assertValidRange(data);
  await assertRangeAvailable(data, id);
  try {
    return await prisma.shippingRate.update({ where: { id }, data });
  } catch {
    throw new ShippingError("Esta tarifa ya no existe.");
  }
}

export async function deleteShippingRate(id: string) {
  if (!isUuid(id)) throw new ShippingError("Tarifa no encontrada.");
  try {
    await prisma.shippingRate.delete({ where: { id } });
  } catch {
    // Ya se borró (doble clic, dos pestañas) — no hay nada que hacer, no es
    // un error real desde la perspectiva del admin.
  }
}
