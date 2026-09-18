import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/utils";

export class AddressError extends Error {}

// Vive aquí (no en address-actions.ts) porque un archivo "use server" solo
// puede exportar funciones async — un objeto Zod ahí rompe la evaluación del
// módulo. También la necesita checkout-actions.ts, así que un solo lugar.
export const addressSchema = z.object({
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

// Compartido por createAddressAction y createCheckoutAddressAction — ambas
// validan y crean una dirección igual, solo cambia a dónde redirigen después.
export async function parseAddressInput(
  formData: FormData,
): Promise<{ error: string } | { data: AddressInput }> {
  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  return { data: parsed.data };
}

export function listAddresses(userId: string) {
  return prisma.address.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
}

// findUnique con un id que no tiene forma de UUID revienta con un error de Postgres
// antes de llegar al chequeo de dueño; lo tratamos igual que "no existe" en vez de
// dejar que se propague como un 500 crudo.
async function getOwnedAddress(userId: string, id: string) {
  if (!isUuid(id)) throw new AddressError("Esta dirección no existe.");
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) {
    throw new AddressError("Esta dirección no te pertenece.");
  }
  return address;
}

type AddressInput = {
  fullName: string;
  whatsapp: string;
  email: string;
  addressLine: string;
  addressType: "casa" | "apartamento";
  city: string;
  state: string;
  zip: string;
  notes: string | null;
};

export function createAddress(userId: string, data: AddressInput) {
  return prisma.address.create({ data: { ...data, userId } });
}

export async function updateAddress(userId: string, id: string, data: AddressInput) {
  await getOwnedAddress(userId, id);
  return prisma.address.update({ where: { id }, data });
}

export async function deleteAddress(userId: string, id: string) {
  const address = await getOwnedAddress(userId, id);
  await prisma.address.delete({ where: { id: address.id } });
}

export async function getAddressForEdit(userId: string, id: string) {
  if (!isUuid(id)) return null;
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) return null;
  return address;
}
