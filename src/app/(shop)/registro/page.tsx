import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-center text-2xl font-semibold text-neutral-900">Crear cuenta</h1>
      <RegisterForm />
    </main>
  );
}
