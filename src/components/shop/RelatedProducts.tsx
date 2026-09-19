"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard, type ProductCardItem } from "@/components/shop/ProductCard";
import { cn } from "@/lib/utils";

export function RelatedProducts({ products }: { products: ProductCardItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Refleja si de verdad queda contenido para cada lado — así las flechas y
  // el difuminado de los bordes se apagan al llegar al principio/final en
  // vez de quedar siempre visibles como si se pudiera seguir desplazando.
  function updateScrollState() {
    const node = scrollerRef.current;
    if (!node) return;
    setCanScrollLeft(node.scrollLeft > 4);
    setCanScrollRight(node.scrollLeft + node.clientWidth < node.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    const node = scrollerRef.current;
    if (!node) return;
    const onResize = () => updateScrollState();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [products]);

  if (products.length === 0) return null;

  function scrollByPage(direction: 1 | -1) {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Productos que te podrían interesar
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Ver anteriores"
            onClick={() => scrollByPage(-1)}
            disabled={!canScrollLeft}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Ver siguientes"
            onClick={() => scrollByPage(1)}
            disabled={!canScrollRight}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div key={product.slug} className="w-[45%] shrink-0 snap-start sm:w-[30%] lg:w-[22%]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent transition-opacity sm:w-16",
            canScrollLeft ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent transition-opacity sm:w-16",
            canScrollRight ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </section>
  );
}
