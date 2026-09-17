import Link from "next/link";
import { CartItemRow } from "@/components/shop/CartItemRow";
import { getCartWithPricing } from "@/server/services/cart-service";
import { requireCustomer } from "@/lib/session";
import { r2PublicUrl } from "@/lib/r2";
import { formatCurrency } from "@/lib/utils";

export default async function CarritoPage() {
  const session = await requireCustomer();
  const cart = await getCartWithPricing(session.userId);

  if (cart.items.length === 0) {
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

      {cart.useWholesalePrice ? (
        <p className="text-sm text-muted-foreground">
          Tienes {cart.totalQuantity} artículos: se aplicó el precio mayorista a todo el carrito.
        </p>
      ) : null}

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

      <div className="flex flex-col gap-2 self-end text-right">
        <div className="flex items-center justify-between gap-8 text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatCurrency(cart.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-8 text-sm text-muted-foreground">
          <span>Envío estimado</span>
          <span>
            {cart.shippingEstimate === null
              ? "Se coordina aparte"
              : formatCurrency(cart.shippingEstimate)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-8 text-lg font-semibold text-foreground">
          <span>Total estimado</span>
          <span>{formatCurrency(cart.subtotal + (cart.shippingEstimate ?? 0))}</span>
        </div>
      </div>
    </div>
  );
}
