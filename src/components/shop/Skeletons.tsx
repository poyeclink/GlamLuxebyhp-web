import { cn } from "@/lib/utils";

// Esqueletos de los loading.tsx de la tienda: imitan la forma de la página real
// para que, al navegar, el cambio se vea al instante y el contenido no salte.
export function Bone({ className }: { className?: string }) {
  return <div className={cn("rounded-md bg-muted motion-safe:animate-pulse", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Bone className="aspect-[4/5] rounded-lg" />
      <div className="flex flex-col gap-2">
        <Bone className="h-2.5 w-1/3" />
        <Bone className="h-4 w-3/4" />
        <Bone className="h-4 w-1/4" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count, className }: { count: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-4 gap-y-10", className)}>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
