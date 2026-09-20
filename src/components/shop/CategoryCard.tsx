import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { t } from "@/lib/i18n";

export type CategoryCardItem = {
  slug: string;
  name: string;
  productCount: number;
};

export async function CategoryCard({ category }: { category: CategoryCardItem }) {
  const productWord = await t(category.productCount === 1 ? "producto" : "productos");

  return (
    <Link href={`/tienda?categoria=${category.slug}`}>
      <Card className="transition-colors hover:border-primary">
        <CardContent className="flex flex-col gap-1 p-5">
          <span className="text-base font-semibold text-foreground">{category.name}</span>
          <span className="text-sm text-muted-foreground">
            {category.productCount} {productWord}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
