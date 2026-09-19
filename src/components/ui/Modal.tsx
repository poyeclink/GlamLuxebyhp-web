"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Duración de la transición de entrada/salida — un solo lugar porque el
// timeout que retrasa el desmontaje (abajo) tiene que coincidir con la
// duración real de las clases `duration-200` o la salida se corta a la mitad.
const TRANSITION_MS = 200;

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  // Ajuste durante el render (no dentro de un efecto): "montar en cuanto
  // `open` pasa a true" y "empezar a desvanecer en cuanto pasa a false" son
  // un espejo directo de la prop, y React recomienda resolver eso así —
  // llamar setState en el cuerpo del render, protegido por comparar contra
  // el valor anterior — en vez de un efecto cuyo único trabajo sería
  // replicar la prop en un estado (lo que devolvía react-hooks/set-state-in-effect).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setShouldRender(true);
    else setIsVisible(false);
  }

  // Lo que sí es un efecto real (programar un timer / rAF, no solo espejar
  // una prop): retrasa el desmontaje mientras corre la transición de salida
  // — con un simple `if (!open) return null`, React lo quita del DOM en el
  // mismo tick en que se pide cerrarlo, así que la animación nunca llega a
  // pintarse.
  useEffect(() => {
    if (!shouldRender) return;

    if (open) {
      // Doble rAF (no uno solo): un solo requestAnimationFrame no garantiza
      // que el navegador ya haya pintado el estado "cerrado" antes de pasar
      // al "abierto" — en ese caso la transición no tiene desde dónde animar
      // y el modal aparece de golpe en vez de con el fade/scale esperado.
      // Encadenar dos rAF fuerza ese pintado intermedio de forma confiable.
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setIsVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }

    const timeout = setTimeout(() => setShouldRender(false), TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [open, shouldRender]);

  // Mismo fix de scroll-lock que MobileNav/AdminMobileNav — atado a
  // `shouldRender` (no a `open`) para que el body siga bloqueado mientras
  // todavía se ve la animación de salida, no solo mientras `open` es true.
  useEffect(() => {
    if (!shouldRender) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Sin esto, el foco del teclado se queda donde estaba en la página de
    // fondo (ej. el botón "Editar" de otra fila) — un admin navegando con Tab
    // recorrería contenido tapado por el overlay antes de llegar al modal.
    // No es un focus trap completo (Tab puede seguir saliendo del modal),
    // pero cubre el caso común sin traer una librería para un panel interno.
    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (open) closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [shouldRender, open, onClose]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-foreground/50 backdrop-blur-sm transition-opacity duration-200 ease-out",
          isVisible ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Móvil: 100% de ancho/alto (h-full w-full, sin radius). Desde md:
          modal centrado normal, no pantalla completa — a propósito distinto
          según el tamaño de pantalla, no el mismo modal escalado. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden bg-background shadow-2xl transition-all duration-200 ease-out",
          "md:h-auto md:max-h-[90vh] md:w-full md:max-w-md md:rounded-xl md:border md:border-border",
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[0.98] translate-y-2",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
