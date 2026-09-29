"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

const MAX_TILT_DEG = 6;

// Inclinación 3D sutil siguiendo al mouse (solo mouse: en touch no hay hover
// y un tap no debe mover el panel).
export function TiltPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const element = ref.current;
    if (!element || event.pointerType !== "mouse") return;
    const rect = element.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.transform = `perspective(1200px) rotateX(${(-py * MAX_TILT_DEG).toFixed(2)}deg) rotateY(${(px * MAX_TILT_DEG).toFixed(2)}deg)`;
  }

  function reset() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={cn("transition-transform duration-300 ease-out will-change-transform motion-reduce:transform-none", className)}
    >
      {children}
    </div>
  );
}
