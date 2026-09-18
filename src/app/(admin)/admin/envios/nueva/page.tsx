import { ShippingRateForm } from "@/components/admin/ShippingRateForm";
import { createShippingRateAction } from "@/server/actions/shipping-actions";

export default function NewShippingRatePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Nueva tarifa de envío</h1>
      <ShippingRateForm action={createShippingRateAction} submitLabel="Crear tarifa" />
    </div>
  );
}
