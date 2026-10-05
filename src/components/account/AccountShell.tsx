import Link from "next/link";
import { LogOut, MapPin, Package, User } from "lucide-react";
import { logoutAction } from "@/server/actions/auth-actions";
import { cn } from "@/lib/utils";
import { t, tMany } from "@/lib/i18n";

const ACCOUNT_LINKS = [
  { key: "perfil", href: "/perfil", label: "Mi perfil", icon: User },
  { key: "pedidos", href: "/pedidos", label: "Mis pedidos", icon: Package },
  { key: "direcciones", href: "/perfil#direcciones", label: "Direcciones", icon: MapPin },
] as const;

const tabClass =
  "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300";

// Server Component: la sección activa la pasa cada página (no hace falta
// usePathname), y el banner es el mismo en perfil, pedidos y direcciones.
export async function AccountShell({
  name,
  active,
  children,
}: {
  name: string;
  active: (typeof ACCOUNT_LINKS)[number]["key"];
  children: React.ReactNode;
}) {
  const [copy, linkLabels] = await Promise.all([
    tMany({ account: "Mi cuenta", hello: "Hola", logout: "Cerrar sesión" }),
    Promise.all(ACCOUNT_LINKS.map((link) => t(link.label))),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 p-3 pb-20 sm:p-4 sm:pb-24">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-inverse px-6 pb-6 pt-10 text-inverse-foreground sm:px-10 sm:pt-12">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-inverse-accent/15 blur-3xl"
        />
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-inverse-accent/50 bg-inverse-border/50 font-display text-3xl text-inverse-accent">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="flex flex-col gap-1">
            <span className="eyebrow text-inverse-accent">{copy.account}</span>
            <h1 className="font-display text-3xl sm:text-4xl">{copy.hello}, {name.split(" ")[0]}</h1>
          </div>
        </div>

        <nav
          aria-label={copy.account}
          className="mt-10 flex gap-2 overflow-x-auto border-t border-inverse-border pt-5 [scrollbar-width:none]"
        >
          {ACCOUNT_LINKS.map(({ key, href, icon: Icon }, index) => (
            <Link
              key={key}
              href={href}
              aria-current={key === active ? "page" : undefined}
              className={cn(
                tabClass,
                key === active
                  ? "bg-inverse-foreground text-inverse"
                  : "text-inverse-muted hover:bg-inverse-border/60 hover:text-inverse-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {linkLabels[index]}
            </Link>
          ))}
          <form action={logoutAction} className="ml-auto">
            <button
              type="submit"
              className={cn(
                tabClass,
                "text-inverse-muted hover:bg-inverse-border/60 hover:text-inverse-foreground",
              )}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {copy.logout}
            </button>
          </form>
        </nav>
      </div>

      <div className="mx-auto w-full max-w-5xl px-1 sm:px-4">{children}</div>
    </div>
  );
}

export function AccountSection({
  id,
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  id?: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-28 flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Icon className="h-4 w-4" />
          </span>
          <div className="flex flex-col">
            <h2 className="font-display text-2xl text-foreground">{title}</h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
