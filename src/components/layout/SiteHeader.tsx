import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { getSession } from "@/lib/session";
import { getLocale, t, tMany } from "@/lib/i18n";
import { resolveCartOwnerForRead } from "@/lib/cart-session";
import { getCartItemCount } from "@/server/services/cart-service";
import { listShopCategories } from "@/server/services/category-service";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/Button";
import { LogoHorizontal } from "@/components/brand/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { CategoryMenu } from "@/components/layout/CategoryMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { HeaderShell } from "@/components/layout/HeaderShell";
import { MainNav } from "@/components/layout/MainNav";
import { SITE_NAME } from "@/lib/site";

// Enlaces estáticos del sitio — a diferencia de las categorías (dinámicas,
// ver CategoryMenu), estas páginas no dependen de datos del catálogo.
const STATIC_NAV_LINKS = [
  { href: "/about", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

const iconLinkClass =
  "relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors duration-300 hover:bg-muted";

function CartLink({ count, label }: { count: number; label: string }) {
  return (
    <Link
      href="/carrito"
      aria-label={`${label} (${count})`}
      className="group flex h-10 items-center gap-2.5 rounded-full pl-2 text-foreground"
    >
      <span className="hidden text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-foreground/70 transition-colors duration-300 group-hover:text-foreground xl:inline">
        {label}
      </span>
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border transition-[border-color,background-color,color] duration-300 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
        <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-semibold tabular-nums text-accent-foreground ring-2 ring-background">
            {count}
          </span>
        )}
      </span>
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

  const [
    storeLabel,
    cartLabel,
    myAccountLabel,
    logoutLabel,
    loginLabel,
    categoriesLabel,
    viewAllLabel,
    ordersLabel,
    translatedCategories,
    staticLabels,
    promoTitle,
    promoText,
    labels,
  ] = await Promise.all([
    t("Tienda"),
    t("Carrito"),
    t("Mi cuenta"),
    t("Cerrar sesión"),
    t("Iniciar sesión"),
    t("Categorías"),
    t("Ver toda la tienda"),
    t("Mis pedidos"),
    Promise.all(
      categories.map(async (category) => ({
        ...category,
        name: await t(category.name),
        children: await Promise.all(
          category.children.map(async (child) => ({ ...child, name: await t(child.name) })),
        ),
      })),
    ),
    Promise.all(STATIC_NAV_LINKS.map((link) => t(link.label))),
    t("Colección completa"),
    t("Bolsos, calzado, ropa y accesorios en un solo lugar."),
    tMany({ home: "Inicio", mainNav: "Principal", openMenu: "Abrir menú", closeMenu: "Cerrar menú" }),
  ]);

  const navLinks = [
    { href: "/tienda", label: storeLabel },
    ...STATIC_NAV_LINKS.map((link, index) => ({ href: link.href, label: staticLabels[index] })),
  ];

  const mobileAuthSlot = (
    <div className="flex flex-col gap-5">
      {isCustomer ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-5 text-sm">
            <Link href="/perfil" className="text-inverse-foreground hover:text-inverse-accent">
              {myAccountLabel}
            </Link>
            <Link href="/pedidos" className="text-inverse-foreground hover:text-inverse-accent">
              {ordersLabel}
            </Link>
          </div>
          <LogoutButton
            label={logoutLabel}
            className="text-inverse-muted hover:bg-inverse-border hover:text-inverse-foreground"
          />
        </div>
      ) : (
        <Link href="/login" className="block">
          <Button variant="inverse" size="lg" className="w-full">
            {loginLabel}
          </Button>
        </Link>
      )}
      <div className="flex justify-center">
        <LanguageSwitcher locale={locale} inverse />
      </div>
    </div>
  );

  return (
    <HeaderShell>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:grid lg:h-20 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          aria-label={`${SITE_NAME} — ${labels.home}`}
          className="w-fit shrink-0 text-foreground transition-opacity duration-300 hover:opacity-75"
        >
          <LogoHorizontal className="h-9 w-auto lg:h-11" />
        </Link>

        <div className="hidden lg:block">
          <MainNav
            label={labels.mainNav}
            links={navLinks}
            categoriesSlot={
              <CategoryMenu
                categories={translatedCategories}
                label={categoriesLabel}
                viewAllLabel={viewAllLabel}
                promoTitle={promoTitle}
                promoText={promoText}
              />
            }
          />
        </div>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <div className="hidden lg:block">
            <LanguageSwitcher locale={locale} />
          </div>
          <span aria-hidden="true" className="mx-2 hidden h-4 w-px bg-border lg:block" />
          {isCustomer ? (
            <div className="hidden lg:block">
              <AccountMenu
                label={myAccountLabel}
                links={[
                  { href: "/perfil", label: myAccountLabel },
                  { href: "/pedidos", label: ordersLabel },
                ]}
                logoutSlot={<LogoutButton label={logoutLabel} />}
              />
            </div>
          ) : (
            <Link
              href="/login"
              aria-label={loginLabel}
              title={loginLabel}
              className={`${iconLinkClass} hidden lg:flex`}
            >
              <User className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.5} />
            </Link>
          )}
          <CartLink count={cartCount} label={cartLabel} />
          <MobileNav
            links={navLinks}
            categoryLinks={translatedCategories.map((category) => ({
              href: `/tienda?categoria=${category.slug}`,
              label: category.name,
            }))}
            categoriesLabel={categoriesLabel}
            labels={{ open: labels.openMenu, close: labels.closeMenu, home: labels.home }}
            authSlot={mobileAuthSlot}
          />
        </div>
      </div>
    </HeaderShell>
  );
}
