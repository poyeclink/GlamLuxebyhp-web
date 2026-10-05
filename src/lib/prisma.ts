import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Sin connectionTimeoutMillis, pg espera una conexión libre para siempre: una
// página quedaba colgada en vez de fallar (y mostrar error.tsx con reintento).
// keepAlive evita que la red corte en silencio las conexiones ociosas del pool
// ("Connection terminated unexpectedly" al reusarlas).
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
