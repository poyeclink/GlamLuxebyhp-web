import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // El CLI (migrate/db push/studio) necesita conexión directa, sin PgBouncer.
  // La app en runtime usa DATABASE_URL (pooled) directamente en src/lib/prisma.ts.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
