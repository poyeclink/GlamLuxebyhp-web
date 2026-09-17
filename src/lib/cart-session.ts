import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/session";
import type { CartOwner } from "@/server/services/cart-service";

const CART_SESSION_COOKIE = "cart_session";
const CART_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 días

export async function getCartSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_SESSION_COOKIE)?.value ?? null;
}

async function createCartSessionToken(): Promise<string> {
  const store = await cookies();
  const token = randomUUID();
  store.set(CART_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_SESSION_DURATION_SECONDS,
  });
  return token;
}

export async function clearCartSessionToken() {
  const store = await cookies();
  store.delete(CART_SESSION_COOKIE);
}

// Para Server Components (páginas, header): cookies() no permite escribir ahí,
// así que nunca crea una — un invitado sin cookie todavía simplemente no tiene carrito.
export async function resolveCartOwnerForRead(): Promise<CartOwner | null> {
  const session = await getSession();
  if (session?.role === "cliente") return { userId: session.userId };

  const token = await getCartSessionToken();
  return token ? { sessionToken: token } : null;
}

// Contraparte de resolveCartOwnerForRead para Server Actions, donde cookies()
// sí permite escribir.
export async function resolveCartOwnerForWrite(): Promise<CartOwner> {
  const session = await getSession();
  if (session?.role === "cliente") return { userId: session.userId };

  const token = (await getCartSessionToken()) ?? (await createCartSessionToken());
  return { sessionToken: token };
}
