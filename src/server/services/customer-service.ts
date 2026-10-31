import { prisma } from "@/lib/prisma";
import { r2PublicUrl } from "@/lib/r2";
import { ADMIN_PAGE_SIZE } from "@/lib/utils";
import type { Prisma } from "@/generated/prisma/client";

const PAID_STATUSES = ["confirmado", "enviado"] as const;

export async function listCustomersAdmin({ search, page }: { search?: string; page: number }) {
  const where: Prisma.UserWhereInput = {
    role: "cliente",
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { whatsapp: { contains: search } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        avatarKey: true,
        createdAt: true,
        _count: { select: { orders: { where: { status: { in: [...PAID_STATUSES] } } } } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const spent = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { in: users.map((user) => user.id) }, status: { in: [...PAID_STATUSES] } },
    _sum: { total: true },
  });
  const spentByUser = new Map(spent.map((row) => [row.userId, Number(row._sum.total ?? 0)]));

  return {
    total,
    items: users.map(({ avatarKey, _count, ...user }) => ({
      ...user,
      avatarUrl: avatarKey ? r2PublicUrl(avatarKey) : null,
      paidOrders: _count.orders,
      totalSpent: spentByUser.get(user.id) ?? 0,
    })),
  };
}

export function countCustomers() {
  return prisma.user.count({ where: { role: "cliente" } });
}
