import { NextResponse, type NextRequest } from "next/server";
import { expireReservedOrders } from "@/server/services/order-service";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  // Rechaza explícitamente si CRON_SECRET no está configurado, en vez de
  // depender de que "Bearer undefined" nunca vaya a coincidir por accidente.
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const result = await expireReservedOrders();
  return NextResponse.json(result);
}
