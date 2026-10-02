import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listShopCategories } from "@/server/services/category-service";
import { listShopProducts } from "@/server/services/product-service";

const STATIC_PATHS = [
  "",
  "/tienda",
  "/about",
  "/contacto",
  "/politicas",
  "/politicas/terminos",
  "/politicas/privacidad",
  "/politicas/devoluciones",
];

// Se regenera cada hora: productos/categorías nuevos del admin entran solos.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([listShopCategories(), listShopProducts()]);

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...categories
      .flatMap((category) => [category, ...category.children])
      .map((category) => ({ url: `${SITE_URL}/tienda?categoria=${category.slug}` })),
    ...products.map((product) => ({ url: `${SITE_URL}/producto/${product.slug}`, lastModified: product.createdAt })),
  ];
}
