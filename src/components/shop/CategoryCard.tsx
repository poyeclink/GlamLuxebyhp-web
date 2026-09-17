import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";

export type CategoryCardItem = {
  slug: string;
  name: string;
  productCount: number;
};

export function CategoryCard({ category }: { category: CategoryCardItem }) {
  return (
    <Link href={`/tienda?categoria=${category.slug}`}>
      <Card className="transition-colors hover:border-primary">
        <CardContent className="flex flex-col gap-1 p-5">
          <span className="text-base font-semibold text-foreground">{category.name}</span>
          <span className="text-sm text-muted-foreground">
            {category.productCount} producto{category.productCount === 1 ? "" : "s"}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
