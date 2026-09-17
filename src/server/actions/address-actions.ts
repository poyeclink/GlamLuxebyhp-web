"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCustomer } from "@/lib/session";
import {
  AddressError,
  createAddress,
  deleteAddress,
  updateAddress,
} from "@/server/services/address-service";

export type AddressActionState = {
  error?: string;
};

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "El nombre es muy corto."),
  whatsapp: z.string().trim().min(7, "Ingresa un número de WhatsApp válido."),
  email: z.email("Correo inválido."),
  addressLine: z.string().trim().min(5, "La dirección es muy corta."),
  addressType: z.enum(["casa", "apartamento"]),
  city: z.string().trim().min(1, "La ciudad es obligatoria."),
  state: z.string().trim().min(1, "El estado es obligatorio."),
  zip: z.string().trim().min(1, "El código postal es obligatorio."),
  // null (no undefined): Prisma trata undefined como "no tocar la columna" en
  // update(), así que un undefined aquí dejaría una nota vieja sin poder borrarse.
  notes: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
});

export async function createAddressAction(
  _prevState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const session = await requireCustomer();

  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  await createAddress(session.userId, parsed.data);
  redirect("/perfil");
}

export async function updateAddressAction(
  id: string,
  _prevState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const session = await requireCustomer();

  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

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
