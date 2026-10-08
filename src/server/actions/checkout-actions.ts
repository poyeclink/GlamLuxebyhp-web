"use server";

import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/session";
import { getLocale, t } from "@/lib/i18n";
import { stripe } from "@/lib/stripe";
import {
  createAddress,
  getAddressForEdit,
  parseAddressInput,
} from "@/server/services/address-service";
import { getCartWithPricing } from "@/server/services/cart-service";
import {
  OrderError,
  createReservedOrder,
  getOrderForCustomer,
  releaseUnpaidOrder,
} from "@/server/services/order-service";
import {
  createCardCheckoutUrl,
  expireCheckoutSession,
  getOpenCheckoutUrl,
} from "@/server/services/card-payment-service";
import type { AddressActionState } from "@/server/actions/address-actions";

export async function createCheckoutAddressAction(
  _prevState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const session = await requireCustomer();

  const parsed = await parseAddressInput(formData);
  if ("error" in parsed) return { error: await t(parsed.error) };

  const address = await createAddress(session.userId, parsed.data);
  redirect(`/checkout/resumen?addressId=${address.id}`);
}

export type CheckoutTermsActionState = { error?: string };

export async function acceptCheckoutTermsAction(
  _prevState: CheckoutTermsActionState,
  formData: FormData,
): Promise<CheckoutTermsActionState> {
  const session = await requireCustomer();

  const cart = await getCartWithPricing({ userId: session.userId });
  if (cart.items.length === 0) redirect("/carrito");

  if (formData.get("termsAccepted") !== "on") {
    return { error: await t("Debes aceptar los términos para continuar.") };
  }

  const addressId = formData.get("addressId");
  if (typeof addressId !== "string")
    return { error: await t("Selecciona una dirección de envío.") };

  // Revalida dueño aquí (no confiar en el addressId de la página, que ya lo
  // validó, ni en el que viaje de vuelta en este POST): el mismo cuidado que
  // documenta CLAUDE.md para cualquier consumidor de este query param.
  const address = await getAddressForEdit(session.userId, addressId);
  if (!address) return { error: await t("Esta dirección ya no está disponible.") };

  const termsAcceptedAt = new Date().toISOString();
  redirect(
    `/checkout/confirmar?addressId=${address.id}&termsAcceptedAt=${encodeURIComponent(termsAcceptedAt)}`,
  );
}

export type ConfirmOrderActionState = { error?: string };

export async function confirmCheckoutOrderAction(
  _prevState: ConfirmOrderActionState,
  formData: FormData,
): Promise<ConfirmOrderActionState> {
  const session = await requireCustomer();

  const cart = await getCartWithPricing({ userId: session.userId });
  if (cart.items.length === 0) redirect("/carrito");

  if (!stripe) return { error: await t("El pago con tarjeta no está disponible en este momento.") };

  const addressId = formData.get("addressId");
  if (typeof addressId !== "string")
    return { error: await t("Selecciona una dirección de envío.") };

  const termsAcceptedAt = formData.get("termsAcceptedAt");
  if (typeof termsAcceptedAt !== "string" || termsAcceptedAt.length === 0) {
    return { error: await t("Debes completar el paso anterior del checkout.") };
  }

  const address = await getAddressForEdit(session.userId, addressId);
  if (!address) return { error: await t("Esta dirección ya no está disponible.") };

  let order;
  try {
    order = await createReservedOrder({
      userId: session.userId,
      address: {
        fullName: address.fullName,
        whatsapp: address.whatsapp,
        email: address.email,
        addressLine: address.addressLine,
        addressType: address.addressType,
        city: address.city,
        state: address.state,
        zip: address.zip,
      },
      paymentMethod: "tarjeta",
      locale: await getLocale(),
    });
  } catch (error) {
    if (error instanceof OrderError) return { error: await t(error.message) };
    throw error;
  }

  // Los correos salen cuando Stripe confirma el cobro (webhook), no aquí.
  let paymentUrl: string;
  try {
    paymentUrl = await createCardCheckoutUrl(order);
  } catch (error) {
    // Sin sesión de pago el pedido no sirve: se deshace y las piezas vuelven
    // al carrito para reintentar.
    console.error(`Stripe: no se pudo crear la sesión del pedido ${order.id}`, error);
    await releaseUnpaidOrder(order.id, "cancelado");
    return { error: await t("No pudimos abrir el pago con tarjeta. Inténtalo de nuevo.") };
  }
  redirect(paymentUrl);
}

async function requireUnpaidOrder(orderId: string) {
  const session = await requireCustomer();
  const order = await getOrderForCustomer(session.userId, orderId);
  if (!order || order.status !== "reservado") redirect(`/pedidos/${orderId}`);
  return order;
}

export async function resumeCardPaymentAction(orderId: string) {
  const order = await requireUnpaidOrder(orderId);
  const url = await getOpenCheckoutUrl(order.id);
  redirect(url ?? `/pedidos/${order.id}`);
}

export async function cancelUnpaidOrderAction(orderId: string) {
  const order = await requireUnpaidOrder(orderId);
  await expireCheckoutSession(order.id);
  await releaseUnpaidOrder(order.id, "cancelado");
  redirect("/carrito");
}
