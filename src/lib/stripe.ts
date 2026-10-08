import Stripe from "stripe";

// Sin STRIPE_SECRET_KEY no se puede pagar el checkout
// (confirmCheckoutOrderAction devuelve un error).
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
