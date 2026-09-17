import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getSession } from "@/lib/session";
import { resolveCartOwnerForRead } from "@/lib/cart-session";
import { getCartItemCount } from "@/server/services/cart-service";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "@/components/layout/MobileNav";

const NAV_LINKS = [{ href: "/tienda", label: "Tienda" }];

function CartLink({ count }: { count: number }) {
  return (
    <Link href="/carrito" aria-label="Carrito" className="relative text-muted-foreground hover:text-foreground">
      <ShoppingBag className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export async function SiteHeader() {
  const session = await getSession();
  const isCustomer = session?.role === "cliente";
  const cartOwner = await resolveCartOwnerForRead();
  const cartCount = cartOwner ? await getCartItemCount(cartOwner) : 0;

  const authSlot = isCustomer ? (
    <div className="flex items-center gap-3">
      <Link href="/perfil" className="text-sm font-medium text-foreground">
        Mi cuenta
      </Link>
      <LogoutButton />
    </div>
  ) : (
    <Link href="/login">
      <Button variant="outline" size="sm">
        Iniciar sesión
      </Button>
    </Link>
  );

  return (
    <header className="relative border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          GlamLuxeByHp
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <CartLink count={cartCount} />
          {authSlot}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <CartLink count={cartCount} />
          <MobileNav links={NAV_LINKS} authSlot={authSlot} />
        </div>
      </div>
    </header>
  );
}
