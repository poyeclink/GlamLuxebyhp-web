import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Isotipo } from "@/components/brand/Logo";
import { PriceDual } from "@/components/ui/PriceDual";
import { cn } from "@/lib/utils";
import { t, tMany } from "@/lib/i18n";

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

export async function ProductCard({ product }: { product: ProductCardItem }) {
  const [copy, name, categoryName] = await Promise.all([
    tMany({ cta: "Ver producto", soldOut: "Agotado", isNew: "Nuevo" }),
    t(product.name),
    Promise.all(product.categoryName.split(" › ").map((part) => t(part))).then((parts) =>
      parts.join(" › "),
    ),
  ]);

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex h-full flex-col gap-4 outline-none"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted ring-accent ring-offset-2 ring-offset-background group-focus-visible:ring-2">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={name}
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
            <Isotipo className="h-auto w-20 [--logo-accent:currentColor]" title="" />
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
            {product.soldOut ? copy.soldOut : copy.isNew}
          </span>
        )}
        <span className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 rounded-full bg-background/95 py-2.5 text-xs font-semibold text-foreground opacity-0 shadow-lg transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          {copy.cta}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="eyebrow text-[0.6875rem] text-muted-foreground">{categoryName}</span>
        <span className="font-medium text-foreground transition-colors group-hover:text-accent">
          {name}
        </span>
        <PriceDual
          wholesalePrice={product.wholesalePrice}
          individualPrice={product.individualPrice}
        />
      </div>
    </Link>
  );
}
