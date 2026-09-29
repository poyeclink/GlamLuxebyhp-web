import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        // Solo con acción: sin ella, flex-row + items-end empujaba el título al
        // fondo de la columna cuando el contenedor era más alto (FAQ de Contacto).
        align === "left" && action && "sm:flex-row sm:items-end sm:justify-between",
      )}
    >
      <div className={cn("flex flex-col gap-2", align === "center" && "items-center")}>
        {eyebrow && <p className="eyebrow text-accent">{eyebrow}</p>}
        <h2 className="font-display text-3xl text-foreground sm:text-4xl">{title}</h2>
        {description && <p className="max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
