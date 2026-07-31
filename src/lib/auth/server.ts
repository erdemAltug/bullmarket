import { createNeonAuth } from '@neondatabase/auth/next/server';
import { NextResponse } from 'next/server';

const baseUrl =
  process.env.NEON_AUTH_BASE_URL?.trim() ||
  process.env.NEON_AUTH_URL?.trim() ||
  '';

const cookieSecret =
  process.env.NEON_AUTH_COOKIE_SECRET?.trim() ||
  'bullmarket-dev-cookie-secret-min-32-chars';

export const authConfigured = Boolean(baseUrl && !baseUrl.includes('invalid.local'));

function assertAuthConfig() {
  if (!authConfigured) {
    throw new Error(
      'NEON_AUTH_BASE_URL (or NEON_AUTH_URL) is missing. Set it in Vercel Environment Variables.'
    );
  }
}

export const auth = createNeonAuth({
  // Placeholder never used when handler is gated; avoids DNS to invalid.local
  baseUrl: baseUrl || 'https://placeholder.neonauth.invalid/neondb/auth',
  cookies: {
    secret: cookieSecret,
  },
  logLevel: 'warn',
});

const neonHandler = auth.handler();

async function guard(
  method: 'GET' | 'POST',
  ...args: Parameters<typeof neonHandler.GET>
) {
  if (!authConfigured) {
    return NextResponse.json(
      {
        error:
          'Neon Auth is not configured. Set NEON_AUTH_BASE_URL, NEON_JWKS_URL, and NEON_AUTH_COOKIE_SECRET on the host.',
        code: 'AUTH_NOT_CONFIGURED',
      },
      { status: 503 }
    );
  }
  try {
    assertAuthConfig();
    return method === 'GET'
      ? neonHandler.GET(...args)
      : neonHandler.POST(...args);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Auth proxy failed';
    return NextResponse.json(
      { error: message, code: 'AUTH_PROXY_ERROR' },
      { status: 502 }
    );
  }
}

export const authRoute = {
  GET: (...args: Parameters<typeof neonHandler.GET>) => guard('GET', ...args),
  POST: (...args: Parameters<typeof neonHandler.POST>) =>
    guard('POST', ...args),
};
