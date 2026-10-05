import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { LogoPrincipal } from "@/components/brand/Logo";

export const metadata: Metadata = { title: "Acceso administrativo", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-inverse px-4 py-12 text-inverse-foreground [--logo-accent:var(--inverse-accent)]">
      <div
        aria-hidden="true"
        className="absolute -left-40 -top-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-inverse-accent/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-48 -right-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-inverse-accent/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />

      <div className="flex w-full max-w-md animate-fade-up flex-col items-center gap-10">
        <LogoPrincipal className="h-24 w-auto sm:h-28" />

        <div className="w-full rounded-[2rem] bg-background p-8 text-foreground shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] sm:p-10">
          <div className="mb-8 flex flex-col gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-inverse text-inverse-accent">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="eyebrow text-accent">Panel administrativo</span>
            <h1 className="font-display text-3xl sm:text-4xl">Acceso restringido</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa con tu cuenta de administrador para gestionar pedidos, catálogo e inventario.
            </p>
          </div>
          <AdminLoginForm />
        </div>

        <Link
          href="/"
          className="group flex items-center gap-2 text-sm text-inverse-muted transition-colors hover:text-inverse-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Volver a la tienda
        </Link>
      </div>
    </main>
  );
}
