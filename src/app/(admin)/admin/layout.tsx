import type { Metadata } from "next";
import Link from "next/link";
import { AdminNavLinks } from "@/components/admin/AdminNavLinks";
import { Wordmark } from "@/components/brand/Logo";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminUserCard } from "@/components/admin/AdminUserCard";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Panel administrativo", template: "%s | Admin · Glam Luxe by HJ" },
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const userCard = <AdminUserCard name={session?.name ?? "Administrador"} />;

  return (
    <>
      {/* Google Fonts hospeda Material Symbols; Next.js "hoistea" cualquier
          <link> renderizado en el árbol hacia el <head>, así que puede vivir
          aquí (único consumidor) en vez de en el layout raíz. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0&display=block"
      />

      <div className="flex min-h-full flex-1 flex-col bg-muted/50 md:flex-row">
        <aside className="hidden shrink-0 flex-col bg-inverse text-inverse-foreground [--logo-accent:var(--inverse-accent)] md:sticky md:top-0 md:flex md:h-screen md:w-68">
          <div className="flex flex-col gap-2 px-6 pb-6 pt-8">
            <Link href="/admin" aria-label="Panel admin" className="w-fit">
              <Wordmark className="h-11 w-auto" title="" />
            </Link>
            <span className="eyebrow text-inverse-muted">Panel administrativo</span>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
            <span className="eyebrow px-3 pb-2 text-[0.625rem] text-inverse-muted/70">Gestión</span>
            <AdminNavLinks />
          </nav>
          <div className="p-3">{userCard}</div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminMobileNav userCard={userCard} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </>
  );
}
