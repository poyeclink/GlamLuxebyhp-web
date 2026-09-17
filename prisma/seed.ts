import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

async function main() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD no configurados — se omite la creación del admin.");
    return;
  }

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash, role: "administrador" },
    create: {
      name: ADMIN_NAME || "Administrador",
      email: ADMIN_EMAIL,
      passwordHash,
      role: "administrador",
    },
  });

  console.log(`Admin listo: ${admin.email}`);

  // Tramos documentados del PDF. El tramo mayorista no tiene fila (envío se
  // coordina aparte); si WHOLESALE_ITEM_THRESHOLD (cart-service.ts) cambia,
  // estos tramos deben cubrir hasta threshold-1 o quedará un hueco sin tarifa.
  const individualRates = [
    { minQuantity: 1, maxQuantity: 2, price: 10 },
    { minQuantity: 3, maxQuantity: 5, price: 35 },
  ];

  for (const rate of individualRates) {
    await prisma.shippingRate.upsert({
      where: { tier_minQuantity: { tier: "individual", minQuantity: rate.minQuantity } },
      update: { maxQuantity: rate.maxQuantity, price: rate.price },
      create: { tier: "individual", ...rate },
    });
  }

  console.log("Tarifas de envío individuales listas.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
