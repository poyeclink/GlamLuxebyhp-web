"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateOrderStatusAction, type OrderActionState } from "@/server/actions/order-actions";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import type { OrderStatus } from "@/generated/prisma/client";

const STATUS_ACTIONS: Record<OrderStatus, string> = {
  reservado: "Marcar como pago pendiente",
  confirmado: "Confirmar pago",
  enviado: "Marcar como enviado",
  cancelado: "Cancelar pedido",
  vencido: "Marcar como vencido",
};

const initialState: OrderActionState = {};

function StatusButtons({ statuses }: { statuses: OrderStatus[] }) {
  const { pending, data } = useFormStatus();

  return statuses.map((status) => {
    const isCancel = status === "cancelado";
    return (
      <Button
        key={status}
        type="submit"
        name="status"
        value={status}
        variant={isCancel ? "outline" : "primary"}
        disabled={pending}
        loading={pending && data?.get("status") === status}
        className={
          isCancel
            ? "w-full text-destructive hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
            : "w-full"
        }
        onClick={(event) => {
          // Cancelar devuelve el stock y no tiene vuelta atrás: un toque accidental en el teléfono no debe bastar.
          if (isCancel && !confirm("¿Cancelar este pedido? Si ya se pagó con tarjeta, se reembolsa automáticamente. Esta acción no se puede deshacer.")) {
            event.preventDefault();
          }
        }}
      >
        {STATUS_ACTIONS[status]}
      </Button>
    );
  });
}

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
    return (
      <p className="text-sm text-muted-foreground">
        Este pedido no tiene más cambios de estado disponibles.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <StatusButtons statuses={allowedNextStatuses} />
      <FormError message={state.error} />
    </form>
  );
}
