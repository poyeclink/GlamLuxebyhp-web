import { createHash } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { getSecretKey } from "@/lib/session";

export const RESET_TOKEN_MINUTES = 60;
const PURPOSE = "password-reset";

// Huella del hash actual: al cambiar la contraseña el hash cambia y cualquier
// enlace ya enviado deja de servir — un solo uso sin tabla de tokens.
function fingerprint(passwordHash: string) {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
}

export function createPasswordResetToken(user: { id: string; passwordHash: string }) {
  return new SignJWT({ purpose: PURPOSE, fp: fingerprint(user.passwordHash) })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${RESET_TOKEN_MINUTES}m`)
    .sign(getSecretKey());
}

export async function readPasswordResetToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.purpose !== PURPOSE || !payload.sub || typeof payload.fp !== "string") return null;
    return { userId: payload.sub, fp: payload.fp };
  } catch {
    return null;
  }
}

export function matchesFingerprint(passwordHash: string, fp: string) {
  return fingerprint(passwordHash) === fp;
}
