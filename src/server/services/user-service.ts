import { prisma } from "@/lib/prisma";

export function getCustomerProfile(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, email: true, whatsapp: true },
  });
}

type ProfileInput = {
  name: string;
  whatsapp: string | null;
};

export function updateProfile(userId: string, data: ProfileInput) {
  return prisma.user.update({ where: { id: userId }, data });
}
