import { auth, authConfigured } from '@/lib/auth/server';

const ANON = 'local-dev-user';

/** Authenticated Neon Auth user id (`sub`), else anonymous fallback. */
export async function getCurrentUserId(): Promise<string> {
  if (authConfigured) {
    try {
      const { data: session } = await auth.getSession();
      if (session?.user?.id) return session.user.id;
    } catch (error) {
      console.error('getCurrentUserId session error:', error);
    }
  }
  return process.env.DEFAULT_USER_ID?.trim() || ANON;
}

export async function getCurrentSessionUser() {
  if (!authConfigured) return null;
  try {
    const { data: session } = await auth.getSession();
    return session?.user ?? null;
  } catch {
    return null;
  }
}

export function isAnonymousUserId(userId: string): boolean {
  return userId === ANON || userId === (process.env.DEFAULT_USER_ID?.trim() || ANON);
}

export function inferAssetType(symbol: string): 'BIST' | 'CRYPTO' | 'FX' {
  const s = symbol.toUpperCase();
  if (s.endsWith('USDT') || s.includes('BTC') || s.includes('ETH')) {
    return 'CRYPTO';
  }
  if (['USD', 'EUR', 'GBP', 'XAU', 'GOLD'].some((c) => s.includes(c))) {
    return 'FX';
  }
  return 'BIST';
}
