"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/session";
import {
  AddressError,
  createAddress,
  deleteAddress,
  parseAddressInput,
  updateAddress,
} from "@/server/services/address-service";

export type AddressActionState = {
  error?: string;
};

export async function createAddressAction(
  _prevState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const session = await requireCustomer();

  const parsed = await parseAddressInput(formData);
  if ("error" in parsed) return parsed;

  await createAddress(session.userId, parsed.data);
  redirect("/perfil");
}

export async function updateAddressAction(
  id: string,
  _prevState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const session = await requireCustomer();

  const parsed = await parseAddressInput(formData);
  if ("error" in parsed) return parsed;

  try {
    await updateAddress(session.userId, id, parsed.data);
  } catch (error) {
    if (error instanceof AddressError) return { error: error.message };
    throw error;
  }

  redirect("/perfil");
}

export async function deleteAddressAction(
  id: string,
  _prevState: AddressActionState,
): Promise<AddressActionState> {
  const session = await requireCustomer();

  try {
    await deleteAddress(session.userId, id);
  } catch (error) {
    if (error instanceof AddressError) return { error: error.message };
    throw error;
  }

  revalidatePath("/perfil");
  return {};
}
