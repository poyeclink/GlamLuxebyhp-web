import { cn } from "@/lib/utils";

// Estilo de th/td desde el contenedor para que cada tabla del admin solo
// declare su estructura (thead/tbody) y no repita clases celda por celda.
export function DataTable({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("overflow-x-auto rounded-2xl border border-border bg-background", className)}
    >
      <table
        className={cn(
          "w-full min-w-[36rem] border-collapse text-sm",
          "[&_thead]:bg-muted/60 [&_th]:px-5 [&_th]:py-3 [&_th:not(.text-right)]:text-left [&_th]:text-[0.6875rem] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.14em] [&_th]:text-muted-foreground",
          "[&_td]:px-5 [&_td]:py-4 [&_tbody_tr]:border-t [&_tbody_tr]:border-border [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-accent-soft/40",
        )}
      >
        {children}
      </table>
    </div>
  );
}
