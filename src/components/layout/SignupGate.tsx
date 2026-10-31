"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { Isotipo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

export type SignupGateCopy = {
  eyebrow: string;
  title: string;
  body: string;
  register: string;
  login: string;
};

// Recorrido libre antes del aviso, en altos de pantalla.
const FREE_SCROLL_SCREENS = 1.5;
const STORAGE_KEY = "glamluxe_signup_gate";

// Solo el catálogo: login/registro, carrito, contacto y políticas (legales)
// siguen abiertos.
function isGated(pathname: string) {
  return pathname === "/" || pathname === "/about" || pathname === "/tienda" || pathname.startsWith("/producto/");
}

function readTripped() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

// Una vez que aparece, en las demás páginas del catálogo vuelve al primer
// scroll. Es un freno de marketing, no seguridad: el HTML ya llegó al
// navegador (y a Google, que no hace scroll).
export function SignupGate({ copy }: { copy: SignupGateCopy }) {
  const pathname = usePathname();
  const [tripped, setTripped] = useState(false);
  const open = tripped && isGated(pathname);

  useEffect(() => {
    if (tripped || !isGated(pathname)) return;
    function onScroll() {
      if (readTripped() || window.scrollY > window.innerHeight * FREE_SCROLL_SCREENS) {
        try {
          sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {}
        setTripped(true);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tripped, pathname]);

  useEffect(() => {
    if (!open) return;
    const main = document.querySelector("main");
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    main?.setAttribute("inert", "");
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      main?.removeAttribute("inert");
    };
  }, [open]);

  if (!open) return null;

  const volver = encodeURIComponent(pathname);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-inverse/40 backdrop-blur-md" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-gate-title"
        className="relative flex w-full animate-fade-up flex-col items-center gap-5 overflow-hidden rounded-t-3xl bg-background px-6 pt-10 pb-[calc(2rem+env(safe-area-inset-bottom))] text-center shadow-2xl md:max-w-md md:rounded-3xl md:px-10 md:pb-10"
      >
        <Isotipo className="h-10 w-auto text-foreground" />
        <div className="flex flex-col gap-3">
          <p className="eyebrow text-accent">{copy.eyebrow}</p>
          <h2 id="signup-gate-title" className="font-display text-3xl leading-tight text-foreground">
            {copy.title}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{copy.body}</p>
        </div>
        <div className="flex w-full flex-col gap-3 pt-1">
          <Link href={`/registro?volver=${volver}`} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
            {copy.register}
          </Link>
          <Link
            href={`/login?volver=${volver}`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
          >
            {copy.login}
          </Link>
        </div>
      </div>
    </div>
  );
}
