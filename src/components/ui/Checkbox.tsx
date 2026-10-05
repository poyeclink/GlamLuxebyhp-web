import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/Label";

type CheckboxProps = ComponentProps<"input"> & {
  label: string;
};

export function Checkbox({ label, id, name, className, ...props }: CheckboxProps) {
  const fieldId = id ?? name;

  return (
    <div className="flex min-h-11 items-center gap-3 sm:min-h-0 sm:gap-2">
      <input
        id={fieldId}
        name={name}
        type="checkbox"
        {...props}
        className={cn(
          "h-5 w-5 shrink-0 rounded border-input text-primary accent-primary focus:ring-1 focus:ring-ring sm:h-4 sm:w-4",
          className,
        )}
      />
      <Label htmlFor={fieldId} className="flex min-h-11 items-center font-normal sm:min-h-0">
        {label}
      </Label>
    </div>
  );
}
