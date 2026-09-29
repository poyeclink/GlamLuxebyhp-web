import { adminLogoutAction } from "@/server/actions/auth-actions";
import { cn } from "@/lib/utils";

export function AdminLogoutButton({ className }: { className?: string }) {
  return (
    <form action={adminLogoutAction}>
      <button
        type="submit"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-inverse-muted transition-colors hover:bg-inverse-border/60 hover:text-inverse-foreground",
          className,
        )}
      >
        <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
          logout
        </span>
        Cerrar sesión
      </button>
    </form>
  );
}
