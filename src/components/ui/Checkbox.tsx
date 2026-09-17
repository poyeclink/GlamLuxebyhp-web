import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/Label";

type CheckboxProps = ComponentProps<"input"> & {
  label: string;
};

export function Checkbox({ label, id, name, className, ...props }: CheckboxProps) {
  const fieldId = id ?? name;

  return (
    <div className="flex items-center gap-2">
      <input
        id={fieldId}
        name={name}
        type="checkbox"
        {...props}
        className={cn(
          "h-4 w-4 rounded border-input text-primary focus:ring-1 focus:ring-ring",
          className,
        )}
      />
      <Label htmlFor={fieldId} className="font-normal">
        {label}
      </Label>
    </div>
  );
}
