import { prisma } from "@/lib/prisma";
import type { InventoryLogReason, Prisma } from "@/generated/prisma/client";
import { ADMIN_PAGE_SIZE, isUuid } from "@/lib/utils";

export class InventoryError extends Error {}

// Umbral para "stock bajo" en el dashboard y el listado de inventario — un
// solo lugar, igual que WHOLESALE_ITEM_THRESHOLD en cart-service.ts.
export const LOW_STOCK_THRESHOLD = 5;

type LogInventoryChangeInput = {
  variantId: string;
  reason: InventoryLogReason;
  quantityChange: number;
  orderId?: string;
  createdBy?: string;
  note?: string;
  // Si el caller ya tiene el stock post-mutación a mano (p.ej. adjustVariantStock,
  // que usa `update` y ya recibió la fila completa de vuelta), lo pasa aquí para
  // evitar un SELECT extra. Los callers que solo pueden usar `updateMany` (la
  // sección crítica atómica de createReservedOrder/releaseOrderStock no soporta
  // devolver la fila) omiten esto y logInventoryChange lo lee él mismo.
  knownStockAfter?: number;
};

// Acepta tanto el cliente `prisma` como un `tx` de $transaction: los llamados
// desde order-service.ts corren dentro de la misma transacción que ya movió
// el stock (para que el log nunca quede huérfano de un rollback), mientras
// que el ajuste manual (abajo) abre su propia transacción.
//
// Tolerante a que la talla ya no exista (no usa findUniqueOrThrow): si se
// borró entre que el caller leyó el pedido/carrito y que corre esta
// transacción, no hay stock que snapshotear — se omite el log en vez de
// tumbar toda la transacción con un error crudo de Prisma.
export async function logInventoryChange(
  client: Prisma.TransactionClient | typeof prisma,
  input: LogInventoryChangeInput,
) {
  let stockAfter = input.knownStockAfter;
  if (stockAfter === undefined) {
    const variant = await client.productVariant.findUnique({
      where: { id: input.variantId },
      select: { stock: true },
    });
    if (!variant) return null;
    stockAfter = variant.stock;
  }

  return client.inventoryLog.create({
    data: {
      variantId: input.variantId,
      reason: input.reason,
      quantityChange: input.quantityChange,
      stockAfter,
      orderId: input.orderId,
      createdBy: input.createdBy,
      note: input.note,
    },
  });
}

export function listInventoryLogsForVariant(variantId: string) {
  return prisma.inventoryLog.findMany({
    where: { variantId },
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { name: true } }, order: { select: { id: true } } },
  });
}

// Stock por variante para el reporte de inventario (ticket admin) — ordenado
// por stock ascendente para que lo más bajo (y lo más urgente) aparezca primero.
export async function listVariantsWithStock({
  search,
  page = 1,
}: { search?: string; page?: number } = {}) {
  const where = search
    ? { product: { name: { contains: search, mode: "insensitive" as const } } }
    : {};
  const [items, total] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      orderBy: { stock: "asc" },
      include: { product: { select: { id: true, name: true, slug: true, active: true } } },
      skip: (Math.max(page, 1) - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.productVariant.count({ where }),
  ]);
  return { items, total };
}

// isUuid antes de golpear Postgres — mismo cuidado que getOrderForAdmin /
// getAddressForEdit: un id con forma inválida (typeado a mano en la URL) da
// null (-> notFound() en la página) en vez de un error crudo de Postgres.
export async function getVariantForAdjustment(variantId: string) {
  if (!isUuid(variantId)) return null;
  return prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: { name: true, slug: true } } },
  });
}

// Ajuste manual de stock (ticket admin de inventario): a diferencia del
// descuento de checkout (createReservedOrder), que usa updateMany con el
// stock en el WHERE para evitar una carrera con OTRO checkout concurrente,
// aquí no hay ese riesgo — es un admin corrigiendo un conteo a mano, no un
// flujo de alta concurrencia — así que un update simple dentro de la
// transacción alcanza; el chequeo de negativo después del update y el throw
// (que revierte la transacción entera) cubre el único caso a evitar.
export async function adjustVariantStock(params: {
  variantId: string;
  delta: number;
  note: string | null;
  adminUserId: string;
}) {
  return prisma.$transaction(async (tx) => {
    let updated;
    try {
      updated = await tx.productVariant.update({
        where: { id: params.variantId },
        data: { stock: { increment: params.delta } },
      });
    } catch {
      // La talla se borró entre que se cargó la página y que se envió el
      // ajuste (otra pestaña, otro admin) — mensaje amigable en vez del error
      // crudo de Prisma que dejaría pasar sin capturar.
      throw new InventoryError("Esta talla ya no existe.");
    }

    if (updated.stock < 0) {
      throw new InventoryError(
        `Este ajuste dejaría el stock en ${updated.stock}. El stock no puede ser negativo.`,
      );
    }

    await logInventoryChange(tx, {
      variantId: params.variantId,
      reason: "ajuste_manual",
      quantityChange: params.delta,
      createdBy: params.adminUserId,
      note: params.note ?? undefined,
      knownStockAfter: updated.stock,
    });

    return updated;
  });
}
