import Link from "next/link";
import { CartItemRow } from "@/components/shop/CartItemRow";
import { WholesaleProgress } from "@/components/shop/WholesaleProgress";
import { CartTotals } from "@/components/shop/CartTotals";
import { Button } from "@/components/ui/Button";
import { WHOLESALE_ITEM_THRESHOLD, getCartWithPricing } from "@/server/services/cart-service";
import { resolveCartOwnerForRead } from "@/lib/cart-session";
import { getSession } from "@/lib/session";
import { r2PublicUrl } from "@/lib/r2";

export default async function CarritoPage() {
  const [session, owner] = await Promise.all([getSession(), resolveCartOwnerForRead()]);
  const isCustomer = session?.role === "cliente";
  const cart = owner ? await getCartWithPricing(owner) : null;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Tu carrito está vacío</h1>
        <Link href="/tienda" className="text-sm font-medium text-foreground hover:underline">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Tu carrito</h1>

      <WholesaleProgress
        totalQuantity={cart.totalQuantity}
        threshold={WHOLESALE_ITEM_THRESHOLD}
        reached={cart.useWholesalePrice}
      />

      <div className="flex flex-col">
        {cart.items.map((item) => (
          <CartItemRow
            key={item.id}
            item={{
              ...item,
              imageUrl: item.imageKey ? r2PublicUrl(item.imageKey) : null,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 self-end">
        <CartTotals subtotal={cart.subtotal} shippingEstimate={cart.shippingEstimate} />
        <Link href={isCustomer ? "/checkout/direccion" : "/login"} className="mt-2">
          <Button className="w-full sm:w-auto">
            {isCustomer ? "Continuar con la compra" : "Inicia sesión para continuar"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
