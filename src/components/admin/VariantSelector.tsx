"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";

// Mismo vocabulario que LETTER_SIZE_ORDER (product-service.ts) — duplicado a
// propósito en vez de importarlo: ese archivo trae `prisma`, y este es un
// Client Component (mismo cuidado que TIER_OPTIONS en ShippingRateForm.tsx).
const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

type CustomRow = { id: string; size: string; stock: string };

export function VariantSelector() {
  const t = useAdminT();
  const [presetStock, setPresetStock] = useState<Record<string, string>>({});
  const [customRows, setCustomRows] = useState<CustomRow[]>([]);

  function togglePreset(size: string, checked: boolean) {
    setPresetStock((current) => {
      const next = { ...current };
      if (checked) next[size] = next[size] ?? "0";
      else delete next[size];
      return next;
    });
  }

  function addCustomRow() {
    setCustomRows((rows) => [...rows, { id: crypto.randomUUID(), size: "", stock: "0" }]);
  }

  function updateCustomRow(id: string, patch: Partial<CustomRow>) {
    setCustomRows((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function removeCustomRow(id: string) {
    setCustomRows((rows) => rows.filter((row) => row.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-x-4 sm:flex sm:flex-wrap sm:gap-y-2">
        {PRESET_SIZES.map((size) => (
          <Checkbox
            key={size}
            id={`preset-size-${size}`}
            label={size}
            checked={size in presetStock}
            onChange={(event) => togglePreset(size, event.target.checked)}
          />
        ))}
      </div>

      {Object.keys(presetStock).length > 0 && (
        <div className="flex flex-col gap-2">
          {PRESET_SIZES.filter((size) => size in presetStock).map((size) => (
            <div key={size} className="flex items-center gap-2">
              <input type="hidden" name="variantSize" value={size} />
              <span className="w-10 text-sm font-medium text-foreground">{size}</span>
              <Input
                aria-label={t("Stock de {size}", { size })}
                name="variantStock"
                type="number"
                inputMode="numeric"
                min="0"
                value={presetStock[size]}
                onChange={(event) =>
                  setPresetStock((current) => ({ ...current, [size]: event.target.value }))
                }
                className="w-28 sm:w-24"
                required
              />
              <span className="text-xs text-muted-foreground">{t("en stock")}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {customRows.map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            <Input
              name="variantSize"
              placeholder={t("Talla (ej. 38)")}
              value={row.size}
              onChange={(event) => updateCustomRow(row.id, { size: event.target.value })}
              aria-label={t("Talla")}
              className="min-w-0 flex-1 sm:w-32 sm:flex-none"
              required
            />
            <Input
              name="variantStock"
              type="number"
              inputMode="numeric"
              min="0"
              value={row.stock}
              aria-label={t("Stock")}
              onChange={(event) => updateCustomRow(row.id, { stock: event.target.value })}
              className="w-24 shrink-0"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-10 shrink-0 px-0 sm:w-8"
              onClick={() => removeCustomRow(row.id)}
              aria-label={row.size ? t("Quitar talla {size}", { size: row.size }) : t("Quitar talla personalizada")}
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
          onClick={addCustomRow}
        >
          {t("Agregar talla personalizada")}
        </Button>
      </div>
    </div>
  );
}
