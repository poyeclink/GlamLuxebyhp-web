"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityInput({
  name,
  defaultValue = 1,
  min = 1,
  max = 9999,
  className,
}: {
  name: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  function clamp(next: number) {
    return Math.min(max, Math.max(min, next));
  }

  return (
    <div
      className={cn(
        "flex h-10 w-fit items-stretch overflow-hidden rounded-md border border-input bg-background",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Disminuir cantidad"
        onClick={() => setValue((current) => clamp(current - 1))}
        disabled={value <= min}
        className="flex w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        name={name}
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          setValue(Number.isNaN(parsed) ? min : parsed);
        }}
        onBlur={() => setValue((current) => clamp(current))}
        className="w-12 border-x border-input bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Aumentar cantidad"
        onClick={() => setValue((current) => clamp(current + 1))}
        disabled={value >= max}
        className="flex w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
