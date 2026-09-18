import { redirect } from "next/navigation";
import { getCartWithPricing } from "@/server/services/cart-service";
import { getAddressForEdit } from "@/server/services/address-service";

// Guard compartido por cada página del wizard de checkout (paso 2 en
// adelante): todas necesitan el mismo par de chequeos antes de renderizar
// (carrito no vacío, addressId de dueño válido) y el mismo destino si fallan.
export async function requireCheckoutCartAndAddress(userId: string, addressId: string | undefined) {
  const cart = await getCartWithPricing({ userId });
  if (cart.items.length === 0) redirect("/carrito");

  const address = addressId ? await getAddressForEdit(userId, addressId) : null;
  if (!address) redirect("/checkout/direccion");

  return { cart, address };
}
