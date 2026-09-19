"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ShippingRateForm } from "@/components/admin/ShippingRateForm";
import { DeleteShippingRateButton } from "@/components/admin/DeleteShippingRateButton";
import { createShippingRateAction, updateShippingRateAction } from "@/server/actions/shipping-actions";
import { formatCurrency } from "@/lib/utils";

type ShippingRate = {
  id: string;
  tier: string;
  minQuantity: number;
  maxQuantity: number | null;
  price: number;
};

type ModalState = { mode: "create" } | { mode: "edit"; rate: ShippingRate } | null;

export function ShippingRatesManager({ rates }: { rates: ShippingRate[] }) {
  const [modal, setModal] = useState<ModalState>(null);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Tarifas de envío</h1>
        <Button onClick={() => setModal({ mode: "create" })}>Nueva tarifa</Button>
      </div>

      {rates.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay tarifas configuradas.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 font-medium">Tier</th>
              <th className="py-2 font-medium">Cantidad</th>
              <th className="py-2 font-medium">Precio</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate.id} className="border-b border-border">
                <td className="py-3 text-foreground">{rate.tier}</td>
                <td className="py-3 text-muted-foreground">
                  {rate.minQuantity}
                  {rate.maxQuantity === null ? "+" : `–${rate.maxQuantity}`}
                </td>
                <td className="py-3 text-foreground">{formatCurrency(rate.price)}</td>
                <td className="py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setModal({ mode: "edit", rate })}>
                      Editar
                    </Button>
                    <DeleteShippingRateButton id={rate.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Editar tarifa" : "Nueva tarifa"}
      >
        {modal !== null && (
          <ShippingRateForm
            action={
              modal.mode === "edit" ? updateShippingRateAction.bind(null, modal.rate.id) : createShippingRateAction
            }
            defaultValues={modal.mode === "edit" ? modal.rate : undefined}
            submitLabel={modal.mode === "edit" ? "Guardar cambios" : "Crear tarifa"}
            onSuccess={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
