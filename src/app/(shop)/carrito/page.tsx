import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { CartItemRow } from "@/components/shop/CartItemRow";
import { WholesaleProgress } from "@/components/shop/WholesaleProgress";
import { CART_TOTALS_COPY, CartTotals } from "@/components/shop/CartTotals";
import { Button } from "@/components/ui/Button";
import { WHOLESALE_ITEM_THRESHOLD, getCartWithPricing } from "@/server/services/cart-service";
import { resolveCartOwnerForRead } from "@/lib/cart-session";
import { getSession } from "@/lib/session";
import { r2PublicUrl } from "@/lib/r2";
import { t, tMany } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await t("Carrito") };
}

export default async function CarritoPage() {
  const [session, owner] = await Promise.all([getSession(), resolveCartOwnerForRead()]);
  const isCustomer = session?.role === "cliente";
  const cart = owner ? await getCartWithPricing(owner) : null;

  if (!cart || cart.items.length === 0) {
    const copy = await tMany({
      title: "Tu carrito está vacío",
      text: "Explora la colección y agrega tus piezas favoritas. Desde {count} artículos todo tu carrito pasa a precio mayorista.",
      cta: "Ir a la tienda",
    });
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-20 text-center sm:py-28">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-inverse text-inverse-accent">
          <ShoppingBag className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">{copy.title}</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {copy.text.replace("{count}", String(WHOLESALE_ITEM_THRESHOLD))}
        </p>
        <Link href="/tienda" className="mt-2">
          <Button size="lg">
            {copy.cta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    );
  }

  const [copy, totalsCopy, rowCopy, items] = await Promise.all([
    tMany({
      eyebrow: "Tu selección",
      title: "Tu carrito",
      summary: "Resumen",
      checkout: "Continuar con la compra",
      login: "Inicia sesión para continuar",
    }),
    tMany(CART_TOTALS_COPY),
    tMany({
      size: "Talla",
      each: "c/u",
      update: "Actualizar",
      remove: "Eliminar",
      pending: "Enviando…",
    }),
    Promise.all(
      cart.items.map(async (item) => ({ ...item, productName: await t(item.productName) })),
    ),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-2">
        <span className="eyebrow text-accent">{copy.eyebrow}</span>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">{copy.title}</h1>
      </div>

      <WholesaleProgress
        totalQuantity={cart.totalQuantity}
        threshold={WHOLESALE_ITEM_THRESHOLD}
        reached={cart.useWholesalePrice}
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div className="flex flex-col border-t border-border">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              copy={rowCopy}
              item={{
                ...item,
                imageUrl: item.imageKey ? r2PublicUrl(item.imageKey) : null,
              }}
            />
          ))}
        </div>

        <aside className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl text-foreground">{copy.summary}</h2>
          <CartTotals
            subtotal={cart.subtotal}
            shippingEstimate={cart.shippingEstimate}
            copy={totalsCopy}
          />
          <Link href={isCustomer ? "/checkout/direccion" : "/login"}>
            <Button size="lg" className="w-full">
              {isCustomer ? copy.checkout : copy.login}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </aside>
      </div>
    </div>
  );
}
