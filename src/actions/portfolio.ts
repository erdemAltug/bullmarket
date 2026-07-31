'use server';

import { and, eq } from 'drizzle-orm';
import { getDb, isDatabaseConfigured } from '@/db';
import { portfolioTransactions } from '@/db/schema';
import { getCurrentUserId } from '@/lib/auth-user';
import type { AssetClass, PortfolioPosition } from '@/types';

function rowToPosition(
  row: typeof portfolioTransactions.$inferSelect
): PortfolioPosition {
  return {
    id: row.id,
    symbol: row.symbol,
    name: row.name,
    assetClass: row.assetClass as AssetClass,
    buyPrice: Number(row.buyPrice),
    quantity: Number(row.quantity),
    date: row.boughtAt.toISOString().slice(0, 10),
    currency: row.currency === 'USD' ? 'USD' : 'TRY',
  };
}

export type PortfolioResult = {
  db: boolean;
  positions: PortfolioPosition[];
};

export async function getUserPortfolio(
  userId?: string
): Promise<PortfolioResult> {
  const uid = userId ?? (await getCurrentUserId());
  if (!isDatabaseConfigured()) {
    return { db: false, positions: [] };
  }

  try {
    const rows = await getDb()
      .select()
      .from(portfolioTransactions)
      .where(eq(portfolioTransactions.userId, uid));
    return { db: true, positions: rows.map(rowToPosition) };
  } catch (error) {
    console.error('Failed to fetch portfolio from Neon DB:', error);
    return { db: false, positions: [] };
  }
}

export async function addPortfolioPosition(
  input: Omit<PortfolioPosition, 'id'>,
  userId?: string
): Promise<PortfolioResult> {
  const uid = userId ?? (await getCurrentUserId());
  if (!isDatabaseConfigured()) {
    return { db: false, positions: [] };
  }

  try {
    const boughtAt = input.date ? new Date(input.date) : new Date();
    await getDb()
      .insert(portfolioTransactions)
      .values({
        userId: uid,
        symbol: input.symbol,
        name: input.name,
        assetClass: input.assetClass,
        buyPrice: String(input.buyPrice),
        quantity: String(input.quantity),
        currency: input.currency,
        boughtAt: Number.isNaN(boughtAt.getTime()) ? new Date() : boughtAt,
      });
    return getUserPortfolio(uid);
  } catch (error) {
    console.error('Failed to add portfolio position:', error);
    throw new Error('Database error');
  }
}

export async function removePortfolioPosition(
  id: string,
  userId?: string
): Promise<PortfolioResult> {
  const uid = userId ?? (await getCurrentUserId());
  if (!isDatabaseConfigured()) {
    return { db: false, positions: [] };
  }

  try {
    await getDb()
      .delete(portfolioTransactions)
      .where(
        and(
          eq(portfolioTransactions.id, id),
          eq(portfolioTransactions.userId, uid)
        )
      );
    return getUserPortfolio(uid);
  } catch (error) {
    console.error('Failed to remove portfolio position:', error);
    throw new Error('Database error');
  }
}
