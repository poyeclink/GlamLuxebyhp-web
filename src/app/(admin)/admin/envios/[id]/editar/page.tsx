import { notFound } from "next/navigation";
import { ShippingRateForm } from "@/components/admin/ShippingRateForm";
import { getShippingRate } from "@/server/services/shipping-service";
import { updateShippingRateAction } from "@/server/actions/shipping-actions";

export default async function EditShippingRatePage({
  params,
}: PageProps<"/admin/envios/[id]/editar">) {
  const { id } = await params;
  const rate = await getShippingRate(id);
  if (!rate) notFound();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Editar tarifa de envío</h1>
      <ShippingRateForm
        action={updateShippingRateAction.bind(null, id)}
        defaultValues={{
          tier: rate.tier,
          minQuantity: rate.minQuantity,
          maxQuantity: rate.maxQuantity,
          price: Number(rate.price),
        }}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
