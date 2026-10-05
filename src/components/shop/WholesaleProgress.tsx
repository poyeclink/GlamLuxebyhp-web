import { t } from "@/lib/i18n";

export async function WholesaleProgress({
  totalQuantity,
  threshold,
  reached,
}: {
  totalQuantity: number;
  threshold: number;
  reached: boolean;
}) {
  const percent = Math.min(100, Math.round((totalQuantity / threshold) * 100));
  const remaining = threshold - totalQuantity;
  const message = reached
    ? (
        await t("Tienes {count} artículos: se aplicó el precio mayorista a todo el carrito.")
      ).replace("{count}", String(totalQuantity))
    : (
        await t(
          remaining === 1
            ? "Agrega {count} artículo más para desbloquear el precio mayorista."
            : "Agrega {count} artículos más para desbloquear el precio mayorista.",
        )
      ).replace("{count}", String(remaining));

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
