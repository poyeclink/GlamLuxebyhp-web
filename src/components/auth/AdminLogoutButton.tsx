import { adminLogoutAction } from "@/server/actions/auth-actions";
import { Button } from "@/components/ui/Button";

export function AdminLogoutButton() {
  return (
    <form action={adminLogoutAction}>
      <Button type="submit" variant="ghost" size="sm">
        Cerrar sesión
      </Button>
    </form>
  );
}
