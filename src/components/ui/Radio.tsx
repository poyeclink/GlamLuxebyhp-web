import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/Label";

type RadioProps = ComponentProps<"input"> & {
  label: string;
};

export function Radio({ label, id, name, value, className, ...props }: RadioProps) {
  const fieldId = id ?? (name && value ? `${name}-${value}` : name);

  return (
    <div className="flex min-h-11 items-center gap-3 sm:min-h-0 sm:gap-2">
      <input
        id={fieldId}
        name={name}
        value={value}
        type="radio"
        {...props}
        className={cn(
          "h-5 w-5 shrink-0 border-input text-primary accent-primary focus:ring-1 focus:ring-ring sm:h-4 sm:w-4",
          className,
        )}
      />
      <Label htmlFor={fieldId} className="flex min-h-11 items-center font-normal sm:min-h-0">
        {label}
      </Label>
    </div>
  );
}
