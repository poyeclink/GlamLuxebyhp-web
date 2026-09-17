import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none",
        "focus:border-ring focus:ring-1 focus:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    />
  );
}
