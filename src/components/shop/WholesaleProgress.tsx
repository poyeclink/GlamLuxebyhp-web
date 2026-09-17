export function WholesaleProgress({
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

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {reached
          ? `Tienes ${totalQuantity} artículos: se aplicó el precio mayorista a todo el carrito.`
          : `Agrega ${remaining} artículo${remaining === 1 ? "" : "s"} más para desbloquear el precio mayorista.`}
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
