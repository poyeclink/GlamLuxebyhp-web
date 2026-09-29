"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TabItem = { id: string; label: string; content: React.ReactNode };

// Patrón WAI-ARIA de tabs: flechas izquierda/derecha mueven el foco y la
// pestaña activa; solo la activa está en el orden de Tab.
export function Tabs({ items, className }: { items: TabItem[]; className?: string }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: React.KeyboardEvent) {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (active + delta + items.length) % items.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <div role="tablist" onKeyDown={onKeyDown} className="flex gap-1 self-center rounded-full border border-border p-1">
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${item.id}`}
            aria-selected={index === active}
            aria-controls={`${baseId}-panel-${item.id}`}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-6",
              index === active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={index !== active}
          className="animate-fade-up"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
