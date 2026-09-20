import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getSession } from "@/lib/session";
import { getLocale, t } from "@/lib/i18n";
import { resolveCartOwnerForRead } from "@/lib/cart-session";
import { getCartItemCount } from "@/server/services/cart-service";
import { listShopCategories } from "@/server/services/category-service";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "@/components/layout/MobileNav";
import { CategoryMenu } from "@/components/layout/CategoryMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

// Enlaces estáticos del sitio — a diferencia de las categorías (dinámicas,
// ver CategoryMenu abajo), estas páginas no dependen de datos y no cambian
// según lo que el admin cree en el catálogo. "Tienda" se renderiza aparte
// (junto al dropdown de categorías) en vez de vivir en esta lista.
const STATIC_NAV_LINKS = [
  { href: "/about", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

function CartLink({ count, label }: { count: number; label: string }) {
  return (
    <Link href="/carrito" aria-label={label} className="relative text-muted-foreground hover:text-foreground">
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
  const [cartOwner, categories, locale] = await Promise.all([
    resolveCartOwnerForRead(),
    listShopCategories(),
    getLocale(),
  ]);
  const cartCount = cartOwner ? await getCartItemCount(cartOwner) : 0;

  const [storeLabel, cartLabel, myAccountLabel, logoutLabel, loginLabel, categoriesLabel, categoryLabels, staticLabels] =
    await Promise.all([
      t("Tienda"),
      t("Carrito"),
      t("Mi cuenta"),
      t("Cerrar sesión"),
      t("Iniciar sesión"),
      t("Categorías"),
      Promise.all(categories.map((category) => t(category.name))),
      Promise.all(STATIC_NAV_LINKS.map((link) => t(link.label))),
    ]);

  // El menú móvil es una lista plana (sin submenú): las categorías se
  // intercalan aquí mismo en vez de replicar el dropdown de escritorio.
  const mobileLinks = [
    { href: "/tienda", label: storeLabel },
    ...categories.map((category, index) => ({
      href: `/tienda?categoria=${category.slug}`,
      label: categoryLabels[index],
    })),
    ...STATIC_NAV_LINKS.map((link, index) => ({ href: link.href, label: staticLabels[index] })),
  ];

  const authSlot = isCustomer ? (
    <div className="flex items-center gap-3">
      <Link href="/perfil" className="text-sm font-medium text-foreground">
        {myAccountLabel}
      </Link>
      <LogoutButton label={logoutLabel} />
    </div>
  ) : (
    <Link href="/login">
      <Button variant="outline" size="sm">
        {loginLabel}
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
          <Link href="/tienda" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            {storeLabel}
          </Link>
          <CategoryMenu
            categories={categories.map((category, index) => ({ ...category, name: categoryLabels[index] }))}
            label={categoriesLabel}
          />
          {STATIC_NAV_LINKS.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {staticLabels[index]}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <LanguageSwitcher locale={locale} />
          <CartLink count={cartCount} label={cartLabel} />
          {authSlot}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher locale={locale} />
          <CartLink count={cartCount} label={cartLabel} />
          <MobileNav links={mobileLinks} authSlot={authSlot} />
        </div>
      </div>
    </header>
  );
}
