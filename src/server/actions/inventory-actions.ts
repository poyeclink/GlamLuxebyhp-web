"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { InventoryError, adjustVariantStock } from "@/server/services/inventory-service";

export type InventoryActionState = {
  error?: string;
};

const adjustSchema = z.object({
  delta: z.coerce.number().int("El ajuste debe ser un número entero.").refine((v) => v !== 0, {
    message: "El ajuste no puede ser cero.",
  }),
  note: z
    .string()
    .trim()
    .max(280, "La nota es muy larga.")
    .optional()
    .transform((v) => (v ? v : null)),
});

export async function adjustVariantStockAction(
  variantId: string,
  _prevState: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const session = await requireAdmin();

  const parsed = adjustSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await adjustVariantStock({
      variantId,
      delta: parsed.data.delta,
      note: parsed.data.note,
      adminUserId: session.userId,
    });
  } catch (error) {
    if (error instanceof InventoryError) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/inventario");
  revalidatePath(`/admin/inventario/${variantId}`);
  revalidatePath("/admin");
  return {};
}
