import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

async function main() {
  const env = process.env;
  const admins = [
    { name: env.ADMIN_NAME || "Administrador", email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD },
    { name: env.DEV_ADMIN_NAME || "Dev Admin", email: env.DEV_ADMIN_EMAIL, password: env.DEV_ADMIN_PASSWORD },
  ];

  for (const { name, email, password } of admins) {
    if (!email || !password) {
      console.log(`Admin ${email ?? name} sin email/contraseña configurados — se omite.`);
      continue;
    }
    const passwordHash = await hashPassword(password);
    const admin = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: "administrador" },
      create: { name, email, passwordHash, role: "administrador" },
    });
    console.log(`Admin listo: ${admin.email}`);
  }

  const { DEMO_CUSTOMER_EMAIL, DEMO_CUSTOMER_PASSWORD } = process.env;
  const existingDemo = DEMO_CUSTOMER_EMAIL
    ? await prisma.user.findUnique({ where: { email: DEMO_CUSTOMER_EMAIL } })
    : null;
  if (existingDemo?.role === "administrador") {
    console.log("DEMO_CUSTOMER_EMAIL pertenece a un admin — se omite el cliente demo.");
  } else if (DEMO_CUSTOMER_EMAIL && DEMO_CUSTOMER_PASSWORD) {
    const customerHash = await hashPassword(DEMO_CUSTOMER_PASSWORD);
    const customer = await prisma.user.upsert({
      where: { email: DEMO_CUSTOMER_EMAIL },
      update: { passwordHash: customerHash, role: "cliente" },
      create: {
        name: "Cliente Demo",
        email: DEMO_CUSTOMER_EMAIL,
        passwordHash: customerHash,
        role: "cliente",
      },
    });
    console.log(`Cliente demo listo: ${customer.email}`);
  }

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

  // Catálogo pedido por la clienta. Se identifica por slug: renombrar una
  // categoría desde el admin no la duplica al volver a correr el seed.
  const genders = [
    { name: "Mujer", slug: "mujer" },
    { name: "Hombre", slug: "hombre" },
  ];
  const categoryTree = [
    { name: "Bolsos", slug: "bolsos" },
    { name: "Zapatos y sandalias", slug: "zapatos", children: genders },
    { name: "Billeteras", slug: "billeteras", children: genders },
    { name: "Lentes de sol", slug: "lentes-de-sol", children: genders },
    { name: "Cinturones", slug: "cinturones" },
    { name: "Accesorios", slug: "accesorios" },
    { name: "Misceláneos", slug: "miscelaneos" },
    { name: "Ropa", slug: "ropa", children: genders },
    { name: "Niños", slug: "ninos" },
  ];

  for (const { children = [], ...root } of categoryTree) {
    const parent = await prisma.category.upsert({
      where: { slug: root.slug },
      update: {},
      create: root,
    });
    for (const child of children) {
      const slug = `${root.slug}-${child.slug}`;
      await prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name: child.name, slug, parentId: parent.id },
      });
    }
  }

  console.log("Categorías y subcategorías listas.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
