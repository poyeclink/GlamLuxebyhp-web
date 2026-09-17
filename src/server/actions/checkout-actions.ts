"use server";

import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/session";
import { createAddress, parseAddressInput } from "@/server/services/address-service";
import type { AddressActionState } from "@/server/actions/address-actions";

export async function createCheckoutAddressAction(
  _prevState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const session = await requireCustomer();

  const parsed = await parseAddressInput(formData);
  if ("error" in parsed) return parsed;

  const address = await createAddress(session.userId, parsed.data);
  redirect(`/checkout/resumen?addressId=${address.id}`);
}
