import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Monogram } from "@/components/brand/Logo";
import { PriceDual } from "@/components/ui/PriceDual";
import { cn } from "@/lib/utils";

export type ProductCardItem = {
  slug: string;
  name: string;
  categoryName: string;
  wholesalePrice: number;
  individualPrice: number;
  imageUrl: string | null;
  hoverImageUrl?: string | null;
  isNew?: boolean;
  soldOut?: boolean;
};

export function ProductCard({
  product,
  ctaLabel = "Ver producto",
}: {
  product: ProductCardItem;
  ctaLabel?: string;
}) {
  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex h-full flex-col gap-4 outline-none"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted ring-accent ring-offset-2 ring-offset-background group-focus-visible:ring-2">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={cn(
              "object-cover transition-[scale,opacity] duration-700 ease-out group-hover:scale-105",
              product.hoverImageUrl && "group-hover:opacity-0",
              product.soldOut && "grayscale-[60%]",
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/40">
            <Monogram className="h-20 w-20" title="" aria-hidden="true" />
          </div>
        )}
        {product.imageUrl && product.hoverImageUrl && (
          <Image
            src={product.hoverImageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="scale-105 object-cover opacity-0 transition-[scale,opacity] duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
          />
        )}
        {(product.soldOut || product.isNew) && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em]",
              product.soldOut
                ? "bg-background/90 text-muted-foreground"
                : "bg-inverse text-inverse-foreground",
            )}
          >
            {product.soldOut ? "Agotado" : "Nuevo"}
          </span>
        )}
        <span className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 rounded-full bg-background/95 py-2.5 text-xs font-semibold text-foreground opacity-0 shadow-lg transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="eyebrow text-[0.6875rem] text-muted-foreground">
          {product.categoryName}
        </span>
        <span className="font-medium text-foreground transition-colors group-hover:text-accent">
          {product.name}
        </span>
        <PriceDual
          wholesalePrice={product.wholesalePrice}
          individualPrice={product.individualPrice}
        />
      </div>
    </Link>
  );
}
