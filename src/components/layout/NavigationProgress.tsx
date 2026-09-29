"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Phase = "idle" | "loading" | "done";

// Si la navegación nunca llega (error de red, redirect a otra URL igual), la
// barra no se queda colgada.
const GIVE_UP_MS = 12000;

// El App Router no expone un evento global de "empezó una navegación": se
// detecta el click en un enlace interno (en captura, antes de que <Link> haga
// preventDefault) y se da por terminada cuando cambia la URL.
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      const anchor = (event.target as Element).closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href);
      if (url.origin !== location.origin) return;
      // A la URL actual no hay nada que esperar, pero Next igual la navega y
      // reemplaza cualquier navegación pendiente: si había una, terminó.
      if (url.pathname === location.pathname && url.search === location.search) {
        setPhase((current) => (current === "loading" ? "done" : current));
        return;
      }
      setPhase("loading");
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const url = `${pathname}?${searchParams}`;
  const [lastUrl, setLastUrl] = useState(url);
  if (url !== lastUrl) {
    setLastUrl(url);
    if (phase === "loading") setPhase("done");
  }

  useEffect(() => {
    const root = document.documentElement;
    if (phase === "loading") {
      root.dataset.navigating = "";
      const timer = setTimeout(() => setPhase("done"), GIVE_UP_MS);
      return () => clearTimeout(timer);
    }
    delete root.dataset.navigating;
    if (phase === "done") {
      const timer = setTimeout(() => setPhase("idle"), 700);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-[linear-gradient(90deg,var(--accent),var(--inverse-accent))] shadow-[0_0_12px_var(--inverse-accent)]",
        // Arranca rápido y se frena cerca del final mientras espera; al llegar
        // la página completa y se desvanece.
        phase === "idle" && "scale-x-0 opacity-0",
        phase === "loading" &&
          "scale-x-90 opacity-100 transition-[scale] duration-[10s] ease-[cubic-bezier(0.05,0.7,0.1,1)]",
        phase === "done" &&
          "scale-x-100 opacity-0 transition-[scale,opacity] duration-300 [transition-delay:0ms,250ms]",
      )}
    />
  );
}
