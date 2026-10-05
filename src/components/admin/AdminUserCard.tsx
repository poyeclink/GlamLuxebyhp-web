import Link from "next/link";
import { AdminLogoutButton } from "@/components/auth/AdminLogoutButton";

export function AdminUserCard({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-inverse-border bg-inverse-border/30 p-2">
      <div className="flex items-center gap-3 px-2 py-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-inverse-accent font-display text-inverse">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-inverse-foreground">{name}</span>
          <span className="text-xs text-inverse-muted">Administrador</span>
        </span>
      </div>
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-inverse-muted transition-colors hover:bg-inverse-border/60 hover:text-inverse-foreground active:bg-inverse-border/60 md:py-2"
      >
        <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
          storefront
        </span>
        Ver tienda
      </Link>
      <AdminLogoutButton className="w-full py-3 active:bg-inverse-border/60 md:py-2" />
    </div>
  );
}
