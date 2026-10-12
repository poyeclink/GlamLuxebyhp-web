"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { AdminCardList, AdminListCard } from "@/components/admin/AdminListCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal } from "@/components/ui/Modal";
import { useAdminT } from "@/components/admin/AdminLocaleProvider";
import { ShippingRateForm } from "@/components/admin/ShippingRateForm";
import { DeleteShippingRateButton } from "@/components/admin/DeleteShippingRateButton";
import {
  createShippingRateAction,
  updateShippingRateAction,
} from "@/server/actions/shipping-actions";
import { formatCurrency } from "@/lib/utils";

type ShippingRate = {
  id: string;
  tier: string;
  minQuantity: number;
  maxQuantity: number | null;
  price: number;
};

function quantityRange(rate: ShippingRate) {
  return `${rate.minQuantity}${rate.maxQuantity === null ? "+" : `–${rate.maxQuantity}`}`;
}

type ModalState = { mode: "create" } | { mode: "edit"; rate: ShippingRate } | null;

export function ShippingRatesManager({ rates }: { rates: ShippingRate[] }) {
  const t = useAdminT();
  const [modal, setModal] = useState<ModalState>(null);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-12">
      <AdminPageHeader
        eyebrow={t("Logística")}
        title={t("Tarifas de envío")}
        description={t("Costo de envío por tramo de cantidad de artículos en el carrito.")}
        action={
          <Button onClick={() => setModal({ mode: "create" })}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("Nueva tarifa")}
          </Button>
        }
      />

      {rates.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
          {t("Todavía no hay tarifas configuradas.")}
        </p>
      ) : (
        <>
          <AdminCardList>
            {rates.map((rate) => (
              <AdminListCard
                key={rate.id}
                title={<span className="capitalize">{t(rate.tier)}</span>}
                meta={t("{range} artículos", { range: quantityRange(rate) })}
                aside={formatCurrency(rate.price)}
                actions={
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setModal({ mode: "edit", rate })}
                    >
                      {t("Editar")}
                    </Button>
                    <DeleteShippingRateButton id={rate.id} />
                  </>
                }
              />
            ))}
          </AdminCardList>
          <DataTable className="hidden md:block">
            <thead>
              <tr>
                <th>{t("Tier")}</th>
                <th>{t("Cantidad")}</th>
                <th>{t("Precio")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.id}>
                  <td className="font-medium capitalize text-foreground">{t(rate.tier)}</td>
                  <td className="text-muted-foreground">{quantityRange(rate)}</td>
                  <td className="text-foreground">{formatCurrency(rate.price)}</td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setModal({ mode: "edit", rate })}
                      >
                        {t("Editar")}
                      </Button>
                      <DeleteShippingRateButton id={rate.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? t("Editar tarifa") : t("Nueva tarifa")}
        closeLabel={t("Cerrar")}
      >
        {modal !== null && (
          <ShippingRateForm
            action={
              modal.mode === "edit"
                ? updateShippingRateAction.bind(null, modal.rate.id)
                : createShippingRateAction
            }
            defaultValues={modal.mode === "edit" ? modal.rate : undefined}
            submitLabel={modal.mode === "edit" ? t("Guardar cambios") : t("Crear tarifa")}
            onSuccess={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
