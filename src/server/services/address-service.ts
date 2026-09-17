import { prisma } from "@/lib/prisma";

export class AddressError extends Error {}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function listAddresses(userId: string) {
  return prisma.address.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
}

// findUnique con un id que no tiene forma de UUID revienta con un error de Postgres
// antes de llegar al chequeo de dueño; lo tratamos igual que "no existe" en vez de
// dejar que se propague como un 500 crudo.
async function getOwnedAddress(userId: string, id: string) {
  if (!UUID_PATTERN.test(id)) throw new AddressError("Esta dirección no existe.");
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
  if (!UUID_PATTERN.test(id)) return null;
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) return null;
  return address;
}
