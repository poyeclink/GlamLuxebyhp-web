"use client";

import { useActionState } from "react";
import { updateOrderStatusAction, type OrderActionState } from "@/server/actions/order-actions";
import { SelectField } from "@/components/ui/SelectField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import type { OrderStatus } from "@/generated/prisma/client";

const STATUS_LABELS: Record<OrderStatus, string> = {
  reservado: "Reservado",
  confirmado: "Confirmado",
  enviado: "Enviado",
  cancelado: "Cancelado",
  vencido: "Vencido",
};

const initialState: OrderActionState = {};

export function OrderStatusForm({
  orderId,
  allowedNextStatuses,
}: {
  orderId: string;
  allowedNextStatuses: OrderStatus[];
}) {
  const [state, formAction] = useActionState(
    updateOrderStatusAction.bind(null, orderId),
    initialState,
  );

  if (allowedNextStatuses.length === 0) {
    return <p className="text-sm text-muted-foreground">Este pedido no tiene más cambios de estado disponibles.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <SelectField label="Cambiar estado a" name="status" defaultValue={allowedNextStatuses[0]}>
            {allowedNextStatuses.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </SelectField>
        </div>
        <SubmitButton className="sm:w-auto">Actualizar</SubmitButton>
      </div>
      <FormError message={state.error} />
    </form>
  );
}
