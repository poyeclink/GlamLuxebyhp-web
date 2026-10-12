"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { getAdminT } from "@/lib/i18n";
import type { AdminT } from "@/lib/admin-i18n";
import {
  ShippingError,
  createShippingRate,
  deleteShippingRate,
  updateShippingRate,
} from "@/server/services/shipping-service";

export type ShippingActionState = {
  error?: string;
  success?: boolean;
};

function shippingErrorMessage(t: AdminT, error: ShippingError) {
  return t(error.message, error.vars);
}

const shippingRateSchema = z.object({
  minQuantity: z.coerce.number().int().min(1, "La cantidad mínima debe ser al menos 1."),
  maxQuantity: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 1), {
      message: "La cantidad máxima debe ser un entero positivo, o vacía.",
    }),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
});

export async function createShippingRateAction(
  _prevState: ShippingActionState,
  formData: FormData,
): Promise<ShippingActionState> {
  await requireAdmin();
  const t = await getAdminT();

  const parsed = shippingRateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: t(parsed.error.issues[0]?.message ?? "Datos inválidos.") };
  }

  try {
    await createShippingRate(parsed.data);
  } catch (error) {
    if (error instanceof ShippingError) return { error: shippingErrorMessage(t, error) };
    throw error;
  }

  // Sin redirect: el formulario ahora vive en un modal sobre /admin/envios (no
  // en una página aparte) — revalidar y devolver éxito basta para que la
  // lista se refresque y el modal se cierre solo.
  revalidatePath("/admin/envios");
  return { success: true };
}

export async function updateShippingRateAction(
  id: string,
  _prevState: ShippingActionState,
  formData: FormData,
): Promise<ShippingActionState> {
  await requireAdmin();
  const t = await getAdminT();

  const parsed = shippingRateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: t(parsed.error.issues[0]?.message ?? "Datos inválidos.") };
  }

  try {
    await updateShippingRate(id, parsed.data);
  } catch (error) {
    if (error instanceof ShippingError) return { error: shippingErrorMessage(t, error) };
    throw error;
  }

  revalidatePath("/admin/envios");
  return { success: true };
}

export async function deleteShippingRateAction(
  id: string,
  _prevState: ShippingActionState,
): Promise<ShippingActionState> {
  await requireAdmin();
  const t = await getAdminT();

  try {
    await deleteShippingRate(id);
  } catch (error) {
    if (error instanceof ShippingError) return { error: shippingErrorMessage(t, error) };
    throw error;
  }

  revalidatePath("/admin/envios");
  return {};
}
