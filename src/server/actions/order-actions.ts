"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import {
  OrderError,
  getOrderForAdmin,
  updateOrderStatus,
} from "@/server/services/order-service";
import { expireCheckoutSession, refundCardPayment } from "@/server/services/card-payment-service";
import { sendOrderStatusEmail } from "@/server/email/notifications";

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
    if (parsed.data.status === "cancelado") {
      const order = await getOrderForAdmin(orderId);
      // Sin pagar: se anula la sesión de Stripe para que ya no se pueda pagar.
      // Pagado con tarjeta: se reembolsa antes de cancelar.
      if (order?.status === "reservado") await expireCheckoutSession(orderId);
      if (order?.status === "confirmado" && order.paymentMethod === "tarjeta") {
        await refundCardPayment(orderId);
      }
    }
    await updateOrderStatus(orderId, parsed.data.status);
    after(() => sendOrderStatusEmail(orderId));
  } catch (error) {
    if (error instanceof OrderError) return { error: error.message };
    throw error;
  }

  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return {};
}
