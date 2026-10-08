import { stripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";
import { OrderError } from "@/server/services/order-service";

function requireStripe() {
  if (!stripe) throw new OrderError("El pago con tarjeta no está disponible en este momento.");
  return stripe;
}

// Stripe Checkout (página alojada por Stripe): los datos de la tarjeta nunca
// pasan por nuestro servidor. El pedido se confirma en el webhook
// (src/app/api/stripe/webhook/route.ts), no al volver a success_url: el
// cliente puede cerrar la pestaña antes de volver.
export async function createCardCheckoutUrl(order: {
  id: string;
  email: string;
  total: { toString(): string };
  reservedUntil: Date;
  locale: string;
}) {
  const session = await requireStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: order.email,
    client_reference_id: order.id,
    metadata: { orderId: order.id },
    payment_intent_data: { metadata: { orderId: order.id } },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(Number(order.total.toString()) * 100),
          product_data: { name: `Glam Luxe by HJ · Pedido #${order.id.slice(0, 8)}` },
        },
      },
    ],
    locale: order.locale === "es" ? "es" : "en",
    // Vence junto con el pedido: al vencer, Stripe avisa por webhook y el
    // stock vuelve al inventario.
    expires_at: Math.floor(order.reservedUntil.getTime() / 1000),
    success_url: `${SITE_URL}/pedidos/${order.id}?pago=ok`,
    cancel_url: `${SITE_URL}/pedidos/${order.id}`,
  });

  if (!session.url) throw new OrderError("No pudimos iniciar el pago con tarjeta.");
  return session.url;
}

// Sin columna en Order para el id de la sesión: las sesiones abiertas duran
// minutos (PAYMENT_WINDOW_MINUTES), así que la lista de abiertas es corta.
async function findOpenSession(orderId: string) {
  for await (const session of requireStripe().checkout.sessions.list({
    status: "open",
    limit: 100,
  })) {
    if (session.metadata?.orderId === orderId) return session;
  }
  return null;
}

export async function getOpenCheckoutUrl(orderId: string) {
  return (await findOpenSession(orderId))?.url ?? null;
}

// Antes de cancelar un pedido sin pagar: anula su sesión para que no se pueda
// pagar después. Si el cliente ya pagó, Stripe rechaza el expire y la
// cancelación no sigue (el webhook lo confirmará).
export async function expireCheckoutSession(orderId: string) {
  if (!stripe) return;
  const session = await findOpenSession(orderId);
  if (session) await stripe.checkout.sessions.expire(session.id);
}

export async function refundCardPayment(orderId: string) {
  const client = requireStripe();
  const { data } = await client.paymentIntents.search({
    query: `metadata['orderId']:'${orderId}' AND status:'succeeded'`,
  });
  if (data.length === 0) {
    throw new OrderError(
      "No encontramos el cobro de este pedido en Stripe. Reembólsalo desde el panel de Stripe.",
    );
  }
  for (const intent of data) await client.refunds.create({ payment_intent: intent.id });
}
