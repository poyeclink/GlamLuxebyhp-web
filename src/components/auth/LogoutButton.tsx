import { logoutAction } from "@/server/actions/auth-actions";
import { Button } from "@/components/ui/Button";

export function LogoutButton({ label = "Cerrar sesión" }: { label?: string }) {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost" size="sm">
        {label}
      </Button>
    </form>
  );
}
