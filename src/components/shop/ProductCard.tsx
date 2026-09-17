import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { PriceDual } from "@/components/ui/PriceDual";

export type ProductCardItem = {
  slug: string;
  name: string;
  categoryName: string;
  wholesalePrice: number;
  individualPrice: number;
  imageUrl: string | null;
};

export function ProductCard({ product }: { product: ProductCardItem }) {
  return (
    <Link href={`/producto/${product.slug}`}>
      <Card className="h-full overflow-hidden transition-colors hover:border-primary">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          ) : null}
        </div>
        <CardContent className="flex flex-col gap-2 p-4">
          <span className="text-xs text-muted-foreground">{product.categoryName}</span>
          <span className="font-medium text-foreground">{product.name}</span>
          <PriceDual
            wholesalePrice={product.wholesalePrice}
            individualPrice={product.individualPrice}
          />
        </CardContent>
      </Card>
    </Link>
  );
}
