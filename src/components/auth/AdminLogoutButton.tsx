import { adminLogoutAction } from "@/server/actions/auth-actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function AdminLogoutButton({ className }: { className?: string }) {
  return (
    <form action={adminLogoutAction}>
      <Button type="submit" variant="ghost" size="sm" className={cn("justify-start gap-3", className)}>
        <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
          logout
        </span>
        Cerrar sesión
      </Button>
    </form>
  );
}
