"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";

// Mismo vocabulario que LETTER_SIZE_ORDER (product-service.ts) — duplicado a
// propósito en vez de importarlo: ese archivo trae `prisma`, y este es un
// Client Component.
const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

type CustomRow = { id: string; size: string };

// Las tallas nuevas quedan disponibles; se marcan agotadas después, desde
// el producto o el inventario.
export function VariantSelector() {
  const t = useAdminT();
  const [customRows, setCustomRows] = useState<CustomRow[]>([]);

  function updateCustomRow(id: string, size: string) {
    setCustomRows((rows) => rows.map((row) => (row.id === id ? { ...row, size } : row)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-x-4 sm:flex sm:flex-wrap sm:gap-y-2">
        {PRESET_SIZES.map((size) => (
          <Checkbox
            key={size}
            id={`preset-size-${size}`}
            label={size}
            name="variantSize"
            value={size}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {customRows.map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            <Input
              name="variantSize"
              placeholder={t("Talla (ej. 38)")}
              value={row.size}
              onChange={(event) => updateCustomRow(row.id, event.target.value)}
              aria-label={t("Talla")}
              className="min-w-0 flex-1 sm:w-32 sm:flex-none"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-10 shrink-0 px-0 sm:w-8"
              onClick={() => setCustomRows((rows) => rows.filter((r) => r.id !== row.id))}
              aria-label={
                row.size
                  ? t("Quitar talla {size}", { size: row.size })
                  : t("Quitar talla personalizada")
              }
            >
              <span
                className="material-symbols-outlined text-[18px] leading-none"
                aria-hidden="true"
              >
                close
              </span>
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-fit"
          onClick={() => setCustomRows((rows) => [...rows, { id: crypto.randomUUID(), size: "" }])}
        >
          {t("Agregar talla personalizada")}
        </Button>
      </div>
    </div>
  );
}
