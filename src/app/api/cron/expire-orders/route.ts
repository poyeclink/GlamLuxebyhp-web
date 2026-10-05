import { NextResponse, type NextRequest } from "next/server";
import { expireReservedOrders } from "@/server/services/order-service";
import { sendOrderStatusEmail } from "@/server/email/notifications";

// Los pedidos quedan vencidos antes de avisar: si la función se corta a mitad
// del envío, esos correos no se reintentan. Margen amplio para Gmail/traducción.
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  // Rechaza explícitamente si CRON_SECRET no está configurado, en vez de
  // depender de que "Bearer undefined" nunca vaya a coincidir por accidente.
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { expiredCount, expiredIds } = await expireReservedOrders();
  // Secuencial: Gmail corta conexiones si se le abren muchas a la vez.
  let emailsSent = 0;
  for (const id of expiredIds) {
    if (await sendOrderStatusEmail(id)) emailsSent++;
  }
  return NextResponse.json({ expiredCount, emailsSent });
}
