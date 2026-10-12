import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const PRODUCT_PREFIX = "/producto/";

// La página de producto streamea (loading.tsx): cuando su notFound() corre, la
// respuesta ya salió como 200. Para un 404 real hay que comprobarlo antes.
// Solo en cargas de documento: las navegaciones internas y los prefetch (RSC)
// no exponen el status y no deben pagar la consulta.
async function productNotFound(request: NextRequest) {
  if (request.method !== "GET" || request.headers.has("rsc")) return null;
  // Sin decodeURIComponent: un "%" malformado lo haría lanzar, y un slug
  // válido solo tiene a-z, 0-9 y guiones (product-actions.ts).
  const slug = request.nextUrl.pathname.slice(PRODUCT_PREFIX.length);
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: { id: true },
  });
  // Misma URL con status 404: la página sigue mostrando su pantalla de "no encontrado".
  return product ? null : NextResponse.rewrite(request.nextUrl, { status: 404 });
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith(PRODUCT_PREFIX)) {
    return (await productNotFound(request)) ?? NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session || session.role !== "administrador") {
      return NextResponse.redirect(new URL("/acceso-admin", request.url));
    }
  } else if (!session || session.role !== "cliente") {
    // /carrito no está aquí a propósito: admite invitados (ticket #22).
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/perfil/:path*",
    "/checkout/:path*",
    "/pedidos/:path*",
    "/producto/:slug",
  ],
};
