'use server';

import { and, eq } from 'drizzle-orm';
import { getDb, isDatabaseConfigured } from '@/db';
import { priceAlerts } from '@/db/schema';
import { getCurrentUserId } from '@/lib/auth-user';
import type { AlertKind, PriceAlert } from '@/types';

function rowToAlert(row: typeof priceAlerts.$inferSelect): PriceAlert {
  return {
    id: row.id,
    symbol: row.symbol,
    displaySymbol: row.displaySymbol,
    kind: row.condition as AlertKind,
    threshold: Number(row.targetPrice),
    triggered: row.isTriggered,
    createdAt: row.createdAt.toISOString(),
  };
}

export type AlertsResult = { db: boolean; alerts: PriceAlert[] };

export async function getUserAlerts(userId?: string): Promise<AlertsResult> {
  const uid = userId ?? (await getCurrentUserId());
  if (!isDatabaseConfigured()) {
    return { db: false, alerts: [] };
  }

  try {
    const rows = await getDb()
      .select()
      .from(priceAlerts)
      .where(eq(priceAlerts.userId, uid));
    return { db: true, alerts: rows.map(rowToAlert) };
  } catch (error) {
    console.error('Failed to fetch alerts from Neon DB:', error);
    return { db: false, alerts: [] };
  }
}

export async function createPriceAlert(
  input: {
    symbol: string;
    displaySymbol: string;
    kind: AlertKind;
    threshold: number;
  },
  userId?: string
): Promise<AlertsResult & { alert?: PriceAlert }> {
  const uid = userId ?? (await getCurrentUserId());
  if (!isDatabaseConfigured()) {
    return { db: false, alerts: [] };
  }

  try {
    const db = getDb();
    await db
      .delete(priceAlerts)
      .where(
        and(
          eq(priceAlerts.userId, uid),
          eq(priceAlerts.symbol, input.symbol),
          eq(priceAlerts.condition, input.kind)
        )
      );

    const [row] = await db
      .insert(priceAlerts)
      .values({
        userId: uid,
        symbol: input.symbol,
        displaySymbol: input.displaySymbol,
        targetPrice: String(input.threshold),
        condition: input.kind,
        isTriggered: false,
      })
      .returning();

    const result = await getUserAlerts(uid);
    return { ...result, alert: row ? rowToAlert(row) : undefined };
  } catch (error) {
    console.error('Failed to create alert in Neon DB:', error);
    throw new Error('Database error');
  }
}

export async function deletePriceAlert(
  id: string,
  userId?: string
): Promise<AlertsResult> {
  const uid = userId ?? (await getCurrentUserId());
  if (!isDatabaseConfigured()) {
    return { db: false, alerts: [] };
  }

  try {
    await getDb()
      .delete(priceAlerts)
      .where(and(eq(priceAlerts.id, id), eq(priceAlerts.userId, uid)));
    return getUserAlerts(uid);
  } catch (error) {
    console.error('Failed to delete alert:', error);
    throw new Error('Database error');
  }
}

export async function setAlertTriggered(
  id: string,
  triggered: boolean,
  userId?: string
): Promise<AlertsResult> {
  const uid = userId ?? (await getCurrentUserId());
  if (!isDatabaseConfigured()) {
    return { db: false, alerts: [] };
  }

  try {
    await getDb()
      .update(priceAlerts)
      .set({ isTriggered: triggered })
      .where(and(eq(priceAlerts.id, id), eq(priceAlerts.userId, uid)));
    return getUserAlerts(uid);
  } catch (error) {
    console.error('Failed to update alert trigger state:', error);
    throw new Error('Database error');
  }
}
