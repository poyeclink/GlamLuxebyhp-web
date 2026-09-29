export const SITE_NAME = "Glam Luxe by HP";
export const SITE_DESCRIPTION =
  "Ropa, bolsos y accesorios de alta calidad, seleccionados pieza por pieza. Compra al detalle o desbloquea precio mayorista desde 6 artículos.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Canales de contacto opcionales: vacío = ese canal simplemente no se muestra
// (mismo criterio que el footer desde que existe NEXT_PUBLIC_WHATSAPP_NUMBER).
export const CONTACT = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || null,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || null,
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || null,
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || null,
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || null,
};

export function whatsappUrl(message?: string) {
  if (!CONTACT.whatsapp) return null;
  return `https://wa.me/${CONTACT.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
