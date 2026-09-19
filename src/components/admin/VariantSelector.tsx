"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// Mismo vocabulario que LETTER_SIZE_ORDER (product-service.ts) — duplicado a
// propósito en vez de importarlo: ese archivo trae `prisma`, y este es un
// Client Component (mismo cuidado que TIER_OPTIONS en ShippingRateForm.tsx).
const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

type CustomRow = { id: string; size: string; stock: string };

export function VariantSelector() {
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
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {PRESET_SIZES.map((size) => (
          <Checkbox
            key={size}
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
                name="variantStock"
                type="number"
                min="0"
                value={presetStock[size]}
                onChange={(event) =>
                  setPresetStock((current) => ({ ...current, [size]: event.target.value }))
                }
                className="w-24"
                required
              />
              <span className="text-xs text-muted-foreground">en stock</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {customRows.map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            <Input
              name="variantSize"
              placeholder="Talla (ej. 38)"
              value={row.size}
              onChange={(event) => updateCustomRow(row.id, { size: event.target.value })}
              className="w-32"
              required
            />
            <Input
              name="variantStock"
              type="number"
              min="0"
              value={row.stock}
              onChange={(event) => updateCustomRow(row.id, { stock: event.target.value })}
              className="w-24"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeCustomRow(row.id)}
              aria-label={`Quitar talla ${row.size || "personalizada"}`}
            >
              <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">
                close
              </span>
            </Button>
          </div>
        ))}

        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={addCustomRow}>
          Agregar talla personalizada
        </Button>
      </div>
    </div>
  );
}
