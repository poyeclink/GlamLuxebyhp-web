import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/Label";

type RadioProps = ComponentProps<"input"> & {
  label: string;
};

export function Radio({ label, id, name, value, className, ...props }: RadioProps) {
  const fieldId = id ?? (name && value ? `${name}-${value}` : name);

  return (
    <div className="flex items-center gap-2">
      <input
        id={fieldId}
        name={name}
        value={value}
        type="radio"
        {...props}
        className={cn("h-4 w-4 border-input text-primary focus:ring-1 focus:ring-ring", className)}
      />
      <Label htmlFor={fieldId} className="font-normal">
        {label}
      </Label>
    </div>
  );
}
