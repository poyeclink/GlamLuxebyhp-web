"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { OrderError, updateOrderStatus } from "@/server/services/order-service";

export type OrderActionState = {
  error?: string;
};

const statusSchema = z.object({
  status: z.enum(["reservado", "confirmado", "enviado", "cancelado", "vencido"]),
});

export async function updateOrderStatusAction(
  orderId: string,
  _prevState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  await requireAdmin();

  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await updateOrderStatus(orderId, parsed.data.status);
  } catch (error) {
    if (error instanceof OrderError) return { error: error.message };
    throw error;
  }

  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return {};
}
