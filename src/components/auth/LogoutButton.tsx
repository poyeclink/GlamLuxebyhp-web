import { logoutAction } from "@/server/actions/auth-actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="text-sm font-medium text-neutral-700 underline hover:text-neutral-900"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
