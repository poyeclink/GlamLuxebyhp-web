import { adminLogoutAction } from "@/server/actions/auth-actions";

export function AdminLogoutButton() {
  return (
    <form action={adminLogoutAction}>
      <button
        type="submit"
        className="text-sm font-medium text-neutral-700 underline hover:text-neutral-900"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
