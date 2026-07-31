import { createNeonAuth } from '@neondatabase/auth/next/server';

const baseUrl =
  process.env.NEON_AUTH_BASE_URL?.trim() ||
  process.env.NEON_AUTH_URL?.trim() ||
  '';

const cookieSecret =
  process.env.NEON_AUTH_COOKIE_SECRET?.trim() ||
  'bullmarket-dev-cookie-secret-min-32-chars';

export const authConfigured = Boolean(baseUrl);

export const auth = createNeonAuth({
  baseUrl: baseUrl || 'https://invalid.local/auth',
  cookies: {
    secret: cookieSecret,
  },
  logLevel: 'warn',
});
