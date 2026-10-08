import { after } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { confirmCardPayment, releaseUnpaidOrder } from "@/server/services/order-service";
import {
  notifyAdminNewOrder,
  notifyLowStockFromOrder,
  sendOrderStatusEmail,
} from "@/server/email/notifications";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Stripe no configurado", { status: 503 });

  let event: Stripe.Event;
  try {
    // La firma se verifica sobre el cuerpo crudo: parsearlo antes la rompe.
    event = stripe.webhooks.constructEvent(
      await request.text(),
      request.headers.get("stripe-signature") ?? "",
      secret,
    );
  } catch {
    return new Response("Firma inválida", { status: 400 });
  }

  if (event.type === "checkout.session.expired") {
    const orderId = event.data.object.metadata?.orderId;
    if (orderId) await releaseUnpaidOrder(orderId, "vencido");
  }

  // completed con payment_status "unpaid" = método asíncrono todavía en curso;
  // ese llega después como async_payment_succeeded (ya "paid").
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (session.payment_status === "paid" && orderId) {
      if (await confirmCardPayment(orderId)) {
        after(() =>
          Promise.all([
            sendOrderStatusEmail(orderId),
            notifyAdminNewOrder(orderId),
            notifyLowStockFromOrder(orderId),
          ]),
        );
      } else {
        await refundIfOrderClosed(orderId, session);
      }
    }
  }

  return Response.json({ received: true });
}

// Pago que llegó para un pedido ya cancelado o vencido (carrera mínima: el
// cliente pagó justo mientras se cancelaba). Su stock ya se liberó, así que se
// devuelve el dinero en vez de confirmarlo. Un evento repetido de un pedido ya
// confirmado no entra aquí.
async function refundIfOrderClosed(orderId: string, session: Stripe.Checkout.Session) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (order?.status !== "cancelado" && order?.status !== "vencido") return;
  try {
    await stripe!.refunds.create({ payment_intent: session.payment_intent as string });
    console.error(`Stripe: pedido ${orderId} pagado tras cancelarse; reembolsado automáticamente.`);
  } catch (error) {
    // Reintento de Stripe de un pago ya reembolsado.
    console.error(`Stripe: no se pudo reembolsar el pedido ${orderId}`, error);
  }
}
