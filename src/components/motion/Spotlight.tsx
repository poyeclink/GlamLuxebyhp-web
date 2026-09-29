"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

// Brillo radial que sigue al cursor dentro de la tarjeta. Escribe --x/--y
// directo en el estilo (sin estado de React) para no re-renderizar en cada
// pointermove.
export function Spotlight({
  children,
  className,
  color = "rgba(92,184,240,0.14)",
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--x", `${event.clientX - rect.left}px`);
    element.style.setProperty("--y", `${event.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      style={{ "--spot": color } as React.CSSProperties}
      className={cn(
        "group/spot relative isolate overflow-hidden",
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
        "before:bg-[radial-gradient(380px_circle_at_var(--x,50%)_var(--y,50%),var(--spot),transparent_70%)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
