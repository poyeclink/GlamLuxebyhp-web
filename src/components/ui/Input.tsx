import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none transition-[border-color,box-shadow] duration-200",
        "placeholder:text-muted-foreground/70 hover:border-foreground/30 focus:border-ring focus:ring-4 focus:ring-ring/15",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    />
  );
}
