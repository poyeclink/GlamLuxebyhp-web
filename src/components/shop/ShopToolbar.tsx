"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { ShopFilterForm, type ShopFilterOptions } from "@/components/shop/ShopFilterForm";
import { SORT_OPTIONS, shopHref, type ShopFilters, type ShopSort } from "@/lib/shop-filters";

export function ShopToolbar({
  filters,
  options,
  activeCount,
}: {
  filters: ShopFilters;
  options: ShopFilterOptions;
  activeCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="lg:hidden">
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filtros
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] text-accent-foreground">
            {activeCount}
          </span>
        )}
      </Button>

      <label className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
        Ordenar
        <Select
          value={filters.orden}
          onChange={(event) =>
            router.push(shopHref(filters, { orden: event.target.value as ShopSort }), {
              scroll: false,
            })
          }
          className="h-9 w-auto min-w-44 text-xs"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>

      <Modal open={open} onClose={() => setOpen(false)} title="Filtrar y ordenar">
        <ShopFilterForm
          key={shopHref(filters)}
          filters={filters}
          options={options}
          idPrefix="m"
          showSort
          onSubmitted={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
