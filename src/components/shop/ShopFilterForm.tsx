"use client";

import Form from "next/form";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, shopHref, type ShopFilters, type ShopSort } from "@/lib/shop-filters";

export type ShopFilterOptions = { sizes: string[]; minPrice: number; maxPrice: number };

export type ShopFilterCopy = {
  sortBy: string;
  price: string;
  from: string;
  to: string;
  size: string;
  availability: string;
  inStock: string;
  apply: string;
  clear: string;
  sortLabels: Record<ShopSort, string>;
};

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 border-b border-border pb-6">
      <legend className="eyebrow mb-3 text-[0.625rem] text-muted-foreground">{title}</legend>
      {children}
    </fieldset>
  );
}

export function ShopFilterForm({
  filters,
  options,
  idPrefix,
  autoSubmit = false,
  showSort = false,
  onSubmitted,
  copy,
}: {
  filters: ShopFilters;
  options: ShopFilterOptions;
  idPrefix: string;
  autoSubmit?: boolean;
  showSort?: boolean;
  onSubmitted?: () => void;
  copy: ShopFilterCopy;
}) {
  const clearHref = shopHref(filters, {
    min: undefined,
    max: undefined,
    tallas: [],
    disponible: false,
  });

  return (
    <Form
      action="/tienda"
      scroll={false}
      onSubmit={onSubmitted}
      // Checkboxes y selects filtran al instante; los precios esperan a Enter
      // o al botón, para no navegar con cada tecla.
      onChange={(event) => {
        const target = event.target as EventTarget as HTMLInputElement;
        if (autoSubmit && target.type !== "number") event.currentTarget.requestSubmit();
      }}
      className="flex flex-col gap-6"
    >
      {filters.categoria && <input type="hidden" name="categoria" value={filters.categoria} />}
      {filters.q && <input type="hidden" name="q" value={filters.q} />}
      {!showSort && filters.orden !== "recientes" && (
        <input type="hidden" name="orden" value={filters.orden} />
      )}

      {showSort && (
        <Group title={copy.sortBy}>
          <Select name="orden" defaultValue={filters.orden} aria-label={copy.sortBy}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {copy.sortLabels[option.value]}
              </option>
            ))}
          </Select>
        </Group>
      )}

      <Group title={copy.price}>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            {copy.from}
            <Input
              type="number"
              name="min"
              min={0}
              inputMode="numeric"
              placeholder={`$${options.minPrice}`}
              defaultValue={filters.min}
              className="h-10"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            {copy.to}
            <Input
              type="number"
              name="max"
              min={0}
              inputMode="numeric"
              placeholder={`$${options.maxPrice}`}
              defaultValue={filters.max}
              className="h-10"
            />
          </label>
        </div>
      </Group>

      {options.sizes.length > 0 && (
        <Group title={copy.size}>
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((size) => {
              const id = `${idPrefix}-talla-${size}`;
              return (
                <label key={size} htmlFor={id} className="cursor-pointer">
                  <input
                    id={id}
                    type="checkbox"
                    name="talla"
                    value={size}
                    defaultChecked={filters.tallas.includes(size)}
                    className="peer sr-only"
                  />
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-full border border-border px-3 text-xs font-medium text-foreground transition-colors duration-200 hover:border-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                    {size}
                  </span>
                </label>
              );
            })}
          </div>
        </Group>
      )}

      <Group title={copy.availability}>
        <label
          htmlFor={`${idPrefix}-disponible`}
          className="flex cursor-pointer items-center gap-3 text-sm text-foreground"
        >
          <input
            id={`${idPrefix}-disponible`}
            type="checkbox"
            name="disponible"
            value="1"
            defaultChecked={filters.disponible}
            className="peer sr-only"
          />
          <span className="flex h-5 w-5 items-center justify-center rounded border border-input text-transparent transition-colors peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          {copy.inStock}
        </label>
      </Group>

      <div className={cn("flex items-center gap-3", autoSubmit && "justify-between")}>
        <Button
          type="submit"
          size="sm"
          variant={autoSubmit ? "outline" : "primary"}
          className={cn(!autoSubmit && "flex-1")}
        >
          {copy.apply}
        </Button>
        <Link
          href={clearHref}
          scroll={false}
          onClick={onSubmitted}
          className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {copy.clear}
        </Link>
      </div>
    </Form>
  );
}
