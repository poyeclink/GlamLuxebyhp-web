import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { t } from "@/lib/i18n";
import { Spotlight } from "@/components/motion/Spotlight";

export type CategoryCardItem = {
  slug: string;
  name: string;
  productCount: number;
};

// Sin fotos de categoría todavía: tile tipográfico que se invierte a Negro
// Noche al hover (el único momento en que la tarjeta se vuelve oscura).
export async function CategoryCard({
  category,
  index,
}: {
  category: CategoryCardItem;
  index: number;
}) {
  const productWord = await t(category.productCount === 1 ? "producto" : "productos");

  return (
    <Link href={`/tienda?categoria=${category.slug}`} className="group hover-lift block rounded-2xl">
      <Spotlight
        color="rgba(92,184,240,0.22)"
        className="flex min-h-48 flex-col justify-between rounded-2xl border border-border bg-background p-6 transition-[background-color,border-color] duration-500 group-hover:border-inverse group-hover:bg-inverse sm:min-h-56"
      >
        <div className="flex items-start justify-between">
          <span className="font-display text-sm text-muted-foreground transition-colors duration-500 group-hover:text-inverse-muted">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-all duration-500 group-hover:rotate-45 group-hover:border-inverse-accent group-hover:bg-inverse-accent group-hover:text-inverse">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-display text-3xl text-foreground transition-colors duration-500 group-hover:text-inverse-foreground">
            {category.name}
          </span>
          <span className="text-sm text-muted-foreground transition-colors duration-500 group-hover:text-inverse-muted">
            {category.productCount} {productWord}
          </span>
        </div>
      </Spotlight>
    </Link>
  );
}
