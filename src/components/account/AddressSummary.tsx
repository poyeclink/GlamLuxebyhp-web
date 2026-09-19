import { Building2, Home } from "lucide-react";

export function AddressSummary({
  address,
}: {
  address: {
    fullName: string;
    addressLine: string;
    city: string;
    state: string;
    zip: string;
    addressType: "casa" | "apartamento";
    whatsapp: string;
  };
}) {
  const TypeIcon = address.addressType === "casa" ? Home : Building2;

  return (
    <div className="flex flex-col gap-0.5 text-sm">
      <span className="font-medium text-foreground">{address.fullName}</span>
      <span className="text-muted-foreground">{address.addressLine}</span>
      <span className="text-muted-foreground">
        {address.city}, {address.state} {address.zip}
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <TypeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {address.addressType === "casa" ? "Casa" : "Apartamento"} · {address.whatsapp}
      </span>
    </div>
  );
}
