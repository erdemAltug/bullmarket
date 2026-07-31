import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

function resolveJwksUrl(): string | null {
  const explicit = process.env.NEON_JWKS_URL?.trim();
  if (explicit) return explicit;
  const base =
    process.env.NEON_AUTH_BASE_URL?.trim() ||
    process.env.NEON_AUTH_URL?.trim();
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/.well-known/jwks.json`;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  const url = resolveJwksUrl();
  if (!url) return null;
  if (!jwks) jwks = createRemoteJWKSet(new URL(url));
  return jwks;
}

/** Verify a Neon Auth JWT via JWKS (`sub`, email, etc.). */
export async function verifyNeonToken(
  token: string
): Promise<JWTPayload | null> {
  const keys = getJwks();
  if (!keys) return null;
  try {
    const { payload } = await jwtVerify(token, keys);
    return payload;
  } catch {
    return null;
  }
}

export type { JWTPayload };
