"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const HIDE_AFTER_PX = 160;

// Estado de cliente del header: sombra al despegarse del top, se esconde al
// bajar y reaparece al subir, y una línea de progreso de lectura.
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    function update() {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      if (Math.abs(y - lastY) > 6) {
        // Con un menú abierto (categorías, cuenta) no se esconde: el panel
        // colgaría a medias fuera de la pantalla.
        const menuOpen = headerRef.current?.querySelector('[aria-expanded="true"]');
        setHidden(y > lastY && y > HIDE_AFTER_PX && !menuOpen);
        lastY = y;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      }
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    // Se esconde animando `top`, no con transform, y con fondo sólido sin
    // backdrop-blur: ambos crearían un containing block para los hijos
    // `fixed` y dejarían el panel de MobileNav atrapado dentro del header.
    <header
      ref={headerRef}
      className={cn(
        "sticky z-40 border-b bg-background transition-[top,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        hidden ? "-top-24 focus-within:top-0" : "top-0",
        scrolled && !hidden
          ? "border-border shadow-[0_10px_40px_-18px_rgba(10,10,11,0.18)]"
          : "border-transparent",
      )}
    >
      {children}
      <span
        ref={progressRef}
        aria-hidden="true"
        style={{ transform: "scaleX(0)" }}
        className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-accent"
      />
    </header>
  );
}
