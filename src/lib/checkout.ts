import { redirect } from "next/navigation";
import { getCartWithPricing } from "@/server/services/cart-service";
import { getAddressForEdit } from "@/server/services/address-service";

// Carrito vacío o con algo agotado/desactivado: de vuelta a /carrito, que
// marca qué línea quitar. Lo usan todas las páginas y acciones del checkout.
export async function requirePurchasableCart(userId: string) {
  const cart = await getCartWithPricing({ userId });
  if (cart.items.length === 0 || cart.hasUnavailable) redirect("/carrito");
  return cart;
}

// Guard compartido por cada página del wizard de checkout (paso 2 en
// adelante): carrito comprable y addressId de dueño válido.
export async function requireCheckoutCartAndAddress(userId: string, addressId: string | undefined) {
  const cart = await requirePurchasableCart(userId);

  const address = addressId ? await getAddressForEdit(userId, addressId) : null;
  if (!address) redirect("/checkout/direccion");

  return { cart, address };
}
