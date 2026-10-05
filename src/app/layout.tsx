import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { getLocale, t } from "@/lib/i18n";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import "./globals.css";

// Pinyon Script no se carga: solo aparece en "by HJ" y el logo ya es SVG en
// trazos (src/components/brand/Logo.tsx) — una fuente menos que descargar.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [locale, tagline, description] = await Promise.all([
    getLocale(),
    t("Moda y accesorios de alta calidad"),
    t(SITE_DESCRIPTION),
  ]);
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} — ${tagline}`,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    appleWebApp: { capable: true, title: "Glam Luxe", statusBarStyle: "default" },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "es" ? "es_ES" : "en_US",
      url: "/",
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  // Sin "cover", env(safe-area-inset-bottom) vale 0 en iPhone y las barras
  // fijas inferiores (agregar al carrito, pestañas del admin) quedan bajo la
  // barra de inicio.
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={await getLocale()} data-scroll-behavior="smooth" className={`${inter.variable} ${bodoni.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {/* useSearchParams exige un Suspense propio o saca del prerender a toda la ruta. */}
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
        <ScrollReveal />
      </body>
    </html>
  );
}
