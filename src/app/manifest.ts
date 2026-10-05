import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { getLocale, t } from "@/lib/i18n";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [lang, description] = await Promise.all([getLocale(), t(SITE_DESCRIPTION)]);
  return {
    id: "/",
    name: SITE_NAME,
    short_name: "Glam Luxe",
    description,
    lang,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#ffffff",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
