import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label {...props} className={cn("text-sm font-medium text-foreground", className)} />;
}
