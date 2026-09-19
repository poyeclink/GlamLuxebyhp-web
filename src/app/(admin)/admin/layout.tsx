import { AdminNavLinks } from "@/components/admin/AdminNavLinks";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminLogoutButton } from "@/components/auth/AdminLogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Google Fonts hospeda Material Symbols; Next.js "hoistea" cualquier
          <link> renderizado en el árbol hacia el <head>, así que puede vivir
          aquí (único consumidor) en vez de en el layout raíz. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0&display=block"
      />

      <div className="flex min-h-full flex-1 flex-col md:flex-row">
        <aside className="hidden shrink-0 flex-col border-r border-border bg-background md:sticky md:top-0 md:flex md:h-screen md:w-64">
          <div className="flex h-14 items-center border-b border-border px-4">
            <span className="text-sm font-semibold text-foreground">GlamLuxeByHp Admin</span>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
            <AdminNavLinks />
          </nav>
          <div className="border-t border-border p-3">
            <AdminLogoutButton className="w-full" />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminMobileNav />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </>
  );
}
