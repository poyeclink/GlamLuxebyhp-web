import { prisma } from "@/lib/prisma";
import { ADMIN_INBOX, sendMail } from "@/lib/mailer";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { formatCurrency } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import { RESET_TOKEN_MINUTES } from "@/lib/password-reset";
import { translate } from "@/server/services/translation-service";
import { getOrderStatusMessage } from "@/server/services/order-service";
import { LOW_STOCK_THRESHOLD, crossedLowStock } from "@/server/services/inventory-service";
import { logoAttachments, renderEmail, type EmailContent } from "@/server/email/template";

const NAV = { shop: "Tienda", contact: "Contacto", policies: "Políticas" };

// Se traduce solo el texto fijo; nombres, montos y fechas se insertan después
// para no llenar la caché de Translation con una fila por cliente.
async function localize<T extends Record<string, string>>(
  texts: T,
  locale: Locale,
): Promise<T & typeof NAV> {
  const all = { ...texts, ...NAV };
  if (locale === "es") return all;
  const entries = await Promise.all(
    Object.entries(all).map(async ([key, text]) => [key, await translate(text, "en")] as const),
  );
  return Object.fromEntries(entries) as T & typeof NAV;
}

const navOf = (c: typeof NAV): [string, string][] => [
  [c.shop, "/tienda"],
  [c.contact, "/contacto"],
  [c.policies, "/politicas"],
];

function send(to: string, subject: string, content: EmailContent, replyTo?: string) {
  return sendMail({ to, subject, replyTo, attachments: logoAttachments, ...renderEmail(content) });
}

function sendToAdmin(
  subject: string,
  content: Omit<EmailContent, "footer" | "eyebrow">,
  replyTo?: string,
) {
  if (!ADMIN_INBOX) return Promise.resolve(false);
  return send(
    ADMIN_INBOX,
    subject,
    {
      ...content,
      eyebrow: "Panel de administración",
      footer: "Aviso automático del panel de administración.",
      nav: [
        ["Panel", "/admin"],
        ["Pedidos", "/admin/pedidos"],
        ["Inventario", "/admin/inventario"],
      ],
    },
    replyTo,
  );
}

const orderNumber = (id: string) => id.slice(0, 8).toUpperCase();

// ——— Cuenta ———

export async function sendWelcomeEmail(user: { name: string; email: string }, locale: Locale) {
  const c = await localize(
    {
      subject: "Te damos la bienvenida a Glam Luxe by HJ",
      eyebrow: "Mi cuenta",
      heading: "Tu cuenta está lista",
      hello: "Hola",
      body: "Gracias por registrarte. Desde tu cuenta puedes guardar direcciones, completar tus compras más rápido y seguir el estado de cada pedido.",
      cta: "Ir a la tienda",
      footer: "Recibes este correo porque creaste una cuenta en nuestra tienda.",
    },
    locale,
  );
  return send(user.email, c.subject, {
    eyebrow: c.eyebrow,
    heading: c.heading,
    paragraphs: [`${c.hello} ${user.name},`, c.body],
    cta: { label: c.cta, href: `${SITE_URL}/tienda` },
    footer: c.footer,
    nav: navOf(c),
  });
}

export async function sendPasswordResetEmail(
  user: { name: string; email: string },
  token: string,
  locale: Locale,
) {
  const c = await localize(
    {
      subject: "Restablece tu contraseña",
      eyebrow: "Seguridad de tu cuenta",
      heading: "Restablece tu contraseña",
      hello: "Hola",
      body: "Recibimos una solicitud para restablecer la contraseña de tu cuenta. Usa el botón de abajo para crear una nueva.",
      expiry: `El enlace vence en ${RESET_TOKEN_MINUTES} minutos y solo funciona una vez.`,
      ignore: "Si no fuiste tú, ignora este correo: tu contraseña no cambia.",
      cta: "Crear nueva contraseña",
      footer: "Recibes este correo porque alguien pidió restablecer la contraseña de esta cuenta.",
    },
    locale,
  );
  return send(user.email, c.subject, {
    eyebrow: c.eyebrow,
    heading: c.heading,
    paragraphs: [`${c.hello} ${user.name},`, c.body, `${c.expiry} ${c.ignore}`],
    cta: { label: c.cta, href: `${SITE_URL}/restablecer?token=${encodeURIComponent(token)}` },
    footer: c.footer,
    nav: navOf(c),
  });
}

export async function sendPasswordChangedEmail(
  user: { name: string; email: string },
  locale: Locale,
) {
  const c = await localize(
    {
      subject: "Tu contraseña cambió",
      eyebrow: "Seguridad de tu cuenta",
      heading: "Tu contraseña cambió",
      hello: "Hola",
      body: "Te confirmamos que la contraseña de tu cuenta se acaba de cambiar.",
      warning: "Si no fuiste tú, restablécela de inmediato y escríbenos.",
      cta: "Restablecer contraseña",
      footer: "Aviso de seguridad de tu cuenta.",
    },
    locale,
  );
  return send(user.email, c.subject, {
    eyebrow: c.eyebrow,
    heading: c.heading,
    paragraphs: [`${c.hello} ${user.name},`, c.body, c.warning],
    cta: { label: c.cta, href: `${SITE_URL}/recuperar` },
    footer: c.footer,
    nav: navOf(c),
  });
}

// ——— Pedidos ———

function loadOrder(orderId: string) {
  return prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
}

type LoadedOrder = NonNullable<Awaited<ReturnType<typeof loadOrder>>>;

function itemRows(
  order: LoadedOrder,
  c: { size: string; quantity: string },
): [string, string, string][] {
  return order.items.map((item) => [
    item.productName,
    formatCurrency(Number(item.unitPrice) * item.quantity),
    [item.variantSize && `${c.size} ${item.variantSize}`, `${c.quantity} ${item.quantity}`]
      .filter(Boolean)
      .join(" · "),
  ]);
}

// Un correo por estado (confirmado desde el webhook de Stripe, enviado y
// cancelado desde el admin), con el mismo copy de "siguientes pasos" que la
// página /pedidos/[id].
export async function sendOrderStatusEmail(orderId: string) {
  const order = await loadOrder(orderId);
  if (!order) return false;
  const locale: Locale = order.locale === "es" ? "es" : "en";
  const message = getOrderStatusMessage(order.status);

  const c = await localize(
    {
      title: message.title,
      description: message.description,
      order: "Pedido #{id}",
      hello: "Hola",
      size: "Talla",
      quantity: "Cantidad",
      subtotal: "Subtotal",
      shipping: "Envío",
      shippingLater: "Se coordina aparte",
      total: "Total",
      cta: "Ver mi pedido",
      footer: "Recibes este correo porque hiciste un pedido en nuestra tienda.",
    },
    locale,
  );
  const number = c.order.replace("{id}", orderNumber(order.id));

  const rows: EmailContent["rows"] = [
    ...itemRows(order, c),
    [c.subtotal, formatCurrency(Number(order.subtotal))],
    [
      c.shipping,
      order.shippingCost === null ? c.shippingLater : formatCurrency(Number(order.shippingCost)),
    ],
  ];

  return send(order.email, `${c.title} · ${number}`, {
    eyebrow: number,
    heading: c.title,
    paragraphs: [`${c.hello} ${order.fullName},`, c.description],
    rows,
    total: [c.total, formatCurrency(Number(order.total))],
    cta: { label: c.cta, href: `${SITE_URL}/pedidos/${order.id}` },
    footer: c.footer,
    nav: navOf(c),
  });
}

export async function notifyAdminNewOrder(orderId: string) {
  const order = await loadOrder(orderId);
  if (!order) return false;
  return sendToAdmin(
    `Nuevo pedido #${orderNumber(order.id)} · ${formatCurrency(Number(order.total))}`,
    {
      heading: `Nuevo pedido #${orderNumber(order.id)}`,
      paragraphs: ["Pagado con tarjeta. Prepara el envío."],
      rows: [
        ["Cliente", order.fullName],
        ["Correo", order.email],
        ["WhatsApp", order.whatsapp],
        ["Dirección", `${order.addressLine}\n${order.city}, ${order.state} ${order.zip}`],
        ["Precio", order.pricingTier === "mayorista" ? "Mayorista" : "Individual"],
        ...itemRows(order, { size: "Talla", quantity: "Cantidad" }),
      ],
      total: ["Total", formatCurrency(Number(order.total))],
      cta: { label: "Ver pedido en el panel", href: `${SITE_URL}/admin/pedidos/${order.id}` },
    },
  );
}

// ——— Leads ———

export function notifyAdminNewCustomer(user: { name: string; email: string }) {
  return sendToAdmin(`Nueva cuenta de cliente: ${user.name}`, {
    heading: "Nueva cuenta de cliente",
    paragraphs: ["Una persona acaba de registrarse en la tienda."],
    rows: [
      ["Nombre", user.name],
      ["Correo", user.email],
    ],
  });
}

export function notifyAdminContactMessage(lead: {
  name: string;
  email: string;
  phone: string | null;
  topic: string;
  message: string;
}) {
  return sendToAdmin(
    `Nuevo mensaje de contacto: ${lead.topic} — ${lead.name}`,
    {
      heading: "Nuevo mensaje desde Contacto",
      paragraphs: [lead.message],
      rows: [
        ["Nombre", lead.name],
        ["Correo", lead.email],
        ...(lead.phone ? ([["Teléfono", lead.phone]] as [string, string][]) : []),
        ["Motivo", lead.topic],
      ],
      cta: { label: "Responder", href: `mailto:${lead.email}` },
    },
    lead.email,
  );
}

// ——— Inventario ———

export async function notifyAdminLowStock(variantIds: string[]) {
  if (variantIds.length === 0) return false;
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    orderBy: { stock: "asc" },
    include: { product: { select: { name: true } } },
  });
  if (variants.length === 0) return false;

  const soldOut = variants.some((v) => v.stock === 0);
  return sendToAdmin(soldOut ? `Producto agotado en ${SITE_NAME}` : `Stock bajo en ${SITE_NAME}`, {
    heading: soldOut ? "Hay tallas agotadas" : "Hay tallas con stock bajo",
    paragraphs: [
      `Estas tallas bajaron a ${LOW_STOCK_THRESHOLD} unidades o menos. Repón inventario o desactiva el producto si ya no lo vas a vender.`,
    ],
    rows: variants.map((v) => [
      `${v.product.name} · Talla ${v.size}`,
      v.stock === 0 ? "Agotado" : `${v.stock} ${v.stock === 1 ? "unidad" : "unidades"}`,
    ]),
    cta: { label: "Gestionar inventario", href: `${SITE_URL}/admin/inventario` },
  });
}

// Solo avisa de las tallas que este pedido hizo cruzar el umbral: una talla
// que ya estaba baja no vuelve a generar un correo con cada venta.
export async function notifyLowStockFromOrder(orderId: string) {
  const logs = await prisma.inventoryLog.findMany({
    where: { orderId, reason: "reserva" },
    select: { variantId: true, stockAfter: true, quantityChange: true },
  });
  const crossed = logs.filter(
    (log) => log.variantId && crossedLowStock(log.stockAfter - log.quantityChange, log.stockAfter),
  );
  return notifyAdminLowStock(crossed.map((log) => log.variantId!));
}
