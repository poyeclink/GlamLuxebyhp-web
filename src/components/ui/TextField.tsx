import type { ComponentProps } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

type TextFieldProps = ComponentProps<"input"> & {
  label: string;
};

export function TextField({ label, id, name, ...props }: TextFieldProps) {
  const fieldId = id ?? name;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} name={name} {...props} />
    </div>
  );
}
