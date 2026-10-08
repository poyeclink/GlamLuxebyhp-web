import type { NextConfig } from "next";

const r2Hostname = process.env.R2_PUBLIC_URL
  ? new URL(process.env.R2_PUBLIC_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // El límite por defecto de los Server Actions es 1MB: una foto de teléfono
  // (producto en el admin, foto de perfil sin reducir) no pasaba. 4MB queda
  // bajo el tope de 4.5MB del cuerpo de una función de Vercel.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  // El PDF de reportes lee los trazos del logo desde public/ con fs; sin esto
  // el archivo no viaja en el bundle serverless de esa ruta.
  outputFileTracingIncludes: {
    "/admin/reportes/pdf": ["./public/brand/glamluxe-horizontal-color-oscuro.svg"],
  },
  images: {
    remotePatterns: [
      ...(r2Hostname ? [{ protocol: "https" as const, hostname: r2Hostname }] : []),
      // Fotos de ambientación temporales (src/lib/stock-images.ts) hasta tener
      // sesiones de fotos propias.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
