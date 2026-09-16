import { prisma } from "@/lib/prisma";

async function main() {
  // Sin modelos todavía — se llenará a medida que se agreguen entidades (ticket #3 en adelante).
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
