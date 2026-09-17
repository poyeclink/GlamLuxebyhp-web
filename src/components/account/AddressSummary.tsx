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
  return (
    <div className="flex flex-col gap-0.5 text-sm">
      <span className="font-medium text-foreground">{address.fullName}</span>
      <span className="text-muted-foreground">{address.addressLine}</span>
      <span className="text-muted-foreground">
        {address.city}, {address.state} {address.zip}
      </span>
      <span className="text-muted-foreground">
        {address.addressType === "casa" ? "Casa" : "Apartamento"} · {address.whatsapp}
      </span>
    </div>
  );
}
