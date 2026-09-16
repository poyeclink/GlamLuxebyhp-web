import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-center text-2xl font-semibold text-neutral-900">Panel administrativo</h1>
      <AdminLoginForm />
    </main>
  );
}
