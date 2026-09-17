import type { ComponentProps } from "react";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";

type SelectFieldProps = ComponentProps<"select"> & {
  label: string;
};

export function SelectField({ label, id, name, children, ...props }: SelectFieldProps) {
  const fieldId = id ?? name;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <Select id={fieldId} name={name} {...props}>
        {children}
      </Select>
    </div>
  );
}
