"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const KEYFRAMES: Keyframe[] = [
  { opacity: 0, translate: "0 2rem" },
  { opacity: 1, translate: "0 0" },
];
const STAGGER_MS = 90;
const MAX_STAGGER_MS = 450;

// Parte `root` en bloques que aparecen por separado: se entra en grids (cada
// celda aparece escalonada), en bandas a sangre con fondo propio (el fondo
// queda fijo y solo se anima su contenido) y en bloques más altos que la
// pantalla (si no, una página larga aparecería de una sola vez).
function collect(root: Element, rootWidth: number, units: HTMLElement[]) {
  for (const child of root.children) {
    if (!(child instanceof HTMLElement) || child.offsetHeight === 0) continue;
    const style = getComputedStyle(child);
    if (style.position === "absolute" || style.position === "fixed") continue;

    const isGrid = style.display.endsWith("grid") && child.children.length > 1;
    const isBand = child.offsetWidth >= rootWidth - 1 && style.backgroundColor !== "rgba(0, 0, 0, 0)";
    const isTall = child.offsetHeight > window.innerHeight * 0.8;
    const splittable = child.children.length > 0 && child.tagName !== "TABLE";

    if (splittable && (isGrid || isBand || isTall)) collect(child, rootWidth, units);
    else units.push(child);
  }
}

// Aparición al hacer scroll en todo el sitio sin envolver nada a mano: lo que
// ya está en pantalla al cargar no se toca (sin parpadeo ni impacto en LCP) y
// el HTML llega completo del servidor. Web Animations en vez de clases: al
// terminar no queda ningún transform pegado al elemento (un transform
// residual atraparía a los hijos `fixed`, como los Modal del admin).
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pending = new Set<HTMLElement>();
    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0;
        for (const entry of entries) {
          const unit = entry.target as HTMLElement;
          if (!entry.isIntersecting || !pending.has(unit)) continue;
          // fill "backwards" cubre el delay, así que la opacidad inline de
          // espera se puede soltar en el mismo instante sin parpadeo.
          unit.animate(KEYFRAMES, {
            duration: 900,
            delay: Math.min(order++ * STAGGER_MS, MAX_STAGGER_MS),
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "backwards",
          });
          unit.style.opacity = "";
          pending.delete(unit);
          observer.unobserve(unit);
        }
      },
    );

    // Lo que aún no apareció saldría en blanco al imprimir.
    function revealAll() {
      for (const unit of pending) unit.style.opacity = "";
      pending.clear();
      observer.disconnect();
    }
    window.addEventListener("beforeprint", revealAll);

    function scan(roots: Iterable<Element>) {
      for (const root of roots) {
        const units: HTMLElement[] = [];
        collect(root, root.clientWidth, units);
        for (const unit of units) {
          if (pending.has(unit) || unit.getBoundingClientRect().top < window.innerHeight) continue;
          unit.style.opacity = "0";
          pending.add(unit);
          observer.observe(unit);
        }
      }
    }

    let frame = requestAnimationFrame(() => scan(document.querySelectorAll("main, footer")));

    // Con loading.tsx la ruta cambia mientras se ve el esqueleto y la página
    // real llega después por streaming: se vuelve a partir `main` cuando su
    // contenido se reemplaza.
    const main = document.querySelector("main");
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => main && scan([main]));
    });
    if (main) mutations.observe(main, { childList: true });

    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      window.removeEventListener("beforeprint", revealAll);
      revealAll();
    };
  }, [pathname]);

  return null;
}
