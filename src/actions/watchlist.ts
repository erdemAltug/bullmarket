'use server';

import { and, eq } from 'drizzle-orm';
import { getDb, isDatabaseConfigured } from '@/db';
import { watchlists } from '@/db/schema';
import {
  getCurrentUserId,
  inferAssetType,
} from '@/lib/auth-user';

export type WatchlistResult = {
  db: boolean;
  symbols: string[];
};

export async function getUserWatchlist(
  userId?: string
): Promise<WatchlistResult> {
  const uid = userId ?? (await getCurrentUserId());
  if (!isDatabaseConfigured()) {
    return { db: false, symbols: [] };
  }

  try {
    const rows = await getDb()
      .select()
      .from(watchlists)
      .where(eq(watchlists.userId, uid));

    return { db: true, symbols: rows.map((r) => r.symbol) };
  } catch (error) {
    console.error('Failed to fetch watchlist from Neon DB:', error);
    return { db: false, symbols: [] };
  }
}

export async function setUserWatchlist(
  symbols: string[],
  userId?: string
): Promise<WatchlistResult> {
  const uid = userId ?? (await getCurrentUserId());
  if (!isDatabaseConfigured()) {
    return { db: false, symbols };
  }

  try {
    const db = getDb();
    const normalized = [
      ...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean)),
    ];

    const existing = await db
      .select()
      .from(watchlists)
      .where(eq(watchlists.userId, uid));
    const have = new Set(existing.map((r) => r.symbol));
    const want = new Set(normalized);

    const toDelete = existing.filter((r) => !want.has(r.symbol));
    for (const row of toDelete) {
      await db
        .delete(watchlists)
        .where(and(eq(watchlists.userId, uid), eq(watchlists.symbol, row.symbol)));
    }

    const toInsert = normalized.filter((s) => !have.has(s));
    if (toInsert.length) {
      await db
        .insert(watchlists)
        .values(
          toInsert.map((symbol) => ({
            userId: uid,
            symbol,
            assetType: inferAssetType(symbol),
          }))
        )
        .onConflictDoNothing();
    }

    return getUserWatchlist(uid);
  } catch (error) {
    console.error('Failed to set watchlist in Neon DB:', error);
    // Prefer returning current state over crashing the UI
    return getUserWatchlist(uid);
  }
}

/** Merge anonymous localStorage symbols into the authenticated user's watchlist. */
export async function migrateAnonymousWatchlist(
  symbols: string[]
): Promise<WatchlistResult> {
  const uid = await getCurrentUserId();
  if (!isDatabaseConfigured()) {
    return { db: false, symbols };
  }

  try {
    const db = getDb();
    const existing = await db
      .select()
      .from(watchlists)
      .where(eq(watchlists.userId, uid));
    const have = new Set(existing.map((r) => r.symbol));
    const incoming = [
      ...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean)),
    ];
    const toInsert = incoming.filter((s) => !have.has(s));

    if (toInsert.length) {
      await db
        .insert(watchlists)
        .values(
          toInsert.map((symbol) => ({
            userId: uid,
            symbol,
            assetType: inferAssetType(symbol),
          }))
        )
        .onConflictDoNothing();
    }

    return getUserWatchlist(uid);
  } catch (error) {
    console.error('Failed to migrate anonymous watchlist:', error);
    return getUserWatchlist(uid).catch(() => ({ db: false, symbols }));
  }
}

export async function toggleWatchlistSymbol(
  symbol: string,
  assetType?: string,
  userId?: string
): Promise<{ action: 'added' | 'removed'; db: boolean }> {
  const uid = userId ?? (await getCurrentUserId());
  const s = symbol.trim().toUpperCase();
  if (!s) throw new Error('Symbol required');

  if (!isDatabaseConfigured()) {
    return { action: 'added', db: false };
  }

  try {
    const db = getDb();
    const existing = await db
      .select()
      .from(watchlists)
      .where(and(eq(watchlists.userId, uid), eq(watchlists.symbol, s)));

    if (existing.length > 0) {
      await db
        .delete(watchlists)
        .where(and(eq(watchlists.userId, uid), eq(watchlists.symbol, s)));
      return { action: 'removed', db: true };
    }

    await db.insert(watchlists).values({
      userId: uid,
      symbol: s,
      assetType: assetType ?? inferAssetType(s),
    });
    return { action: 'added', db: true };
  } catch (error) {
    console.error('Failed to update watchlist in Neon DB:', error);
    throw new Error('Database error');
  }
}

export async function addWatchlistSymbol(
  symbol: string,
  userId?: string
): Promise<WatchlistResult> {
  const uid = userId ?? (await getCurrentUserId());
  const s = symbol.trim().toUpperCase();
  if (!isDatabaseConfigured()) {
    return { db: false, symbols: [] };
  }

  try {
    const db = getDb();
    const existing = await db
      .select()
      .from(watchlists)
      .where(and(eq(watchlists.userId, uid), eq(watchlists.symbol, s)));

    if (!existing.length) {
      await db.insert(watchlists).values({
        userId: uid,
        symbol: s,
        assetType: inferAssetType(s),
      });
    }

    return getUserWatchlist(uid);
  } catch (error) {
    console.error('Failed to add watchlist symbol:', error);
    throw new Error('Database error');
  }
}

export async function removeWatchlistSymbol(
  symbol: string,
  userId?: string
): Promise<WatchlistResult> {
  const uid = userId ?? (await getCurrentUserId());
  const s = symbol.trim().toUpperCase();
  if (!isDatabaseConfigured()) {
    return { db: false, symbols: [] };
  }

  try {
    await getDb()
      .delete(watchlists)
      .where(and(eq(watchlists.userId, uid), eq(watchlists.symbol, s)));
    return getUserWatchlist(uid);
  } catch (error) {
    console.error('Failed to remove watchlist symbol:', error);
    throw new Error('Database error');
  }
}
