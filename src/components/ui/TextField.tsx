import type { ComponentProps } from "react";

type TextFieldProps = ComponentProps<"input"> & {
  label: string;
};

export function TextField({ label, id, name, ...props }: TextFieldProps) {
  const fieldId = id ?? name;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        {...props}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
      />
    </div>
  );
}
