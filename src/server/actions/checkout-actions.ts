"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireCustomer } from "@/lib/session";
import { getLocale, t } from "@/lib/i18n";
import {
  notifyAdminNewOrder,
  notifyLowStockFromOrder,
  sendOrderStatusEmail,
} from "@/server/email/notifications";
import {
  createAddress,
  getAddressForEdit,
  parseAddressInput,
} from "@/server/services/address-service";
import { getCartWithPricing } from "@/server/services/cart-service";
import { isPaymentMethod } from "@/server/services/payment-service";
import { OrderError, createReservedOrder } from "@/server/services/order-service";
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
    `/checkout/pago?addressId=${address.id}&termsAcceptedAt=${encodeURIComponent(termsAcceptedAt)}`,
  );
}

export type CheckoutPaymentActionState = { error?: string };

export async function selectCheckoutPaymentMethodAction(
  _prevState: CheckoutPaymentActionState,
  formData: FormData,
): Promise<CheckoutPaymentActionState> {
  const session = await requireCustomer();

  const cart = await getCartWithPricing({ userId: session.userId });
  if (cart.items.length === 0) redirect("/carrito");

  const addressId = formData.get("addressId");
  if (typeof addressId !== "string")
    return { error: await t("Selecciona una dirección de envío.") };

  // termsAcceptedAt solo viaja como señal de "paso 2 completado" (ver
  // CLAUDE.md) — si falta, el cliente saltó el paso de términos.
  const termsAcceptedAt = formData.get("termsAcceptedAt");
  if (typeof termsAcceptedAt !== "string" || termsAcceptedAt.length === 0) {
    return { error: await t("Debes completar el paso anterior del checkout.") };
  }

  const paymentMethod = formData.get("paymentMethod");
  if (!isPaymentMethod(paymentMethod)) {
    return { error: await t("Selecciona un método de pago.") };
  }

  const address = await getAddressForEdit(session.userId, addressId);
  if (!address) return { error: await t("Esta dirección ya no está disponible.") };

  redirect(
    `/checkout/confirmar?addressId=${address.id}` +
      `&termsAcceptedAt=${encodeURIComponent(termsAcceptedAt)}` +
      `&paymentMethod=${encodeURIComponent(paymentMethod)}`,
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

  const addressId = formData.get("addressId");
  if (typeof addressId !== "string")
    return { error: await t("Selecciona una dirección de envío.") };

  const termsAcceptedAt = formData.get("termsAcceptedAt");
  if (typeof termsAcceptedAt !== "string" || termsAcceptedAt.length === 0) {
    return { error: await t("Debes completar el paso anterior del checkout.") };
  }

  const paymentMethod = formData.get("paymentMethod");
  if (!isPaymentMethod(paymentMethod)) {
    return { error: await t("Selecciona un método de pago.") };
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
      paymentMethod,
      locale: await getLocale(),
    });
  } catch (error) {
    if (error instanceof OrderError) return { error: await t(error.message) };
    throw error;
  }

  const orderId = order.id;
  after(() =>
    Promise.all([
      sendOrderStatusEmail(orderId),
      notifyAdminNewOrder(orderId),
      notifyLowStockFromOrder(orderId),
    ]),
  );
  redirect(`/pedidos/${order.id}`);
}
