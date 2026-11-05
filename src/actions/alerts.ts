'use server';

import { and, eq, isNull, ne } from 'drizzle-orm';
import { getDb, isDatabaseConfigured } from '@/db';
import { priceAlerts } from '@/db/schema';
import { getCurrentSessionUser, getCurrentUserId } from '@/lib/auth-user';
import { FREE_LIMITS } from '@/lib/pro-plan';
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
    const db = getDb();
    const rows = await db
      .select()
      .from(priceAlerts)
      .where(eq(priceAlerts.userId, uid));
    // Backfill the owner e-mail on alerts created before the column existed.
    if (rows.some((r) => !r.email)) {
      const email = (await getCurrentSessionUser())?.email?.trim();
      if (email) {
        await db
          .update(priceAlerts)
          .set({ email })
          .where(and(eq(priceAlerts.userId, uid), isNull(priceAlerts.email)));
      }
    }
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
): Promise<AlertsResult & { alert?: PriceAlert; limitReached?: boolean }> {
  const uid = userId ?? (await getCurrentUserId());
  if (!isDatabaseConfigured()) {
    return { db: false, alerts: [] };
  }

  try {
    const db = getDb();
    // Free plan: at most N active alerts. Replacing the same symbol + kind
    // doesn't count as a new one.
    const existing = await db.select().from(priceAlerts).where(eq(priceAlerts.userId, uid));
    const active = existing.filter(
      (r) => !r.isTriggered && !(r.symbol === input.symbol && r.condition === input.kind)
    );
    if (active.length >= FREE_LIMITS.activeAlerts) {
      return { db: true, alerts: existing.map(rowToAlert), limitReached: true };
    }

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
        email: (await getCurrentSessionUser())?.email?.trim() || null,
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

export async function updatePriceAlert(
  id: string,
  input: {
    kind: AlertKind;
    threshold: number;
    displaySymbol?: string;
  },
  userId?: string
): Promise<AlertsResult> {
  const uid = userId ?? (await getCurrentUserId());
  if (!isDatabaseConfigured()) {
    return { db: false, alerts: [] };
  }

  try {
    const db = getDb();
    const existing = await db
      .select()
      .from(priceAlerts)
      .where(and(eq(priceAlerts.id, id), eq(priceAlerts.userId, uid)))
      .limit(1);

    const row = existing[0];
    if (!row) return getUserAlerts(uid);

    // Drop any other row that would collide on (symbol, kind)
    await db.delete(priceAlerts).where(
      and(
        eq(priceAlerts.userId, uid),
        eq(priceAlerts.symbol, row.symbol),
        eq(priceAlerts.condition, input.kind),
        ne(priceAlerts.id, id)
      )
    );

    await db
      .update(priceAlerts)
      .set({
        condition: input.kind,
        targetPrice: String(input.threshold),
        displaySymbol: input.displaySymbol ?? row.displaySymbol,
        isTriggered: false,
        notifiedAt: null,
      })
      .where(and(eq(priceAlerts.id, id), eq(priceAlerts.userId, uid)));

    return getUserAlerts(uid);
  } catch (error) {
    console.error('Failed to update alert:', error);
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
      // Re-arming clears the e-mail claim so the next trigger notifies again.
      .set(triggered ? { isTriggered: true } : { isTriggered: false, notifiedAt: null })
      .where(and(eq(priceAlerts.id, id), eq(priceAlerts.userId, uid)));
    return getUserAlerts(uid);
  } catch (error) {
    console.error('Failed to update alert trigger state:', error);
    throw new Error('Database error');
  }
}

/** Merge anonymous localStorage alerts into the authenticated user's Neon set. */
export async function migrateAnonymousAlerts(
  incoming: {
    symbol: string;
    displaySymbol: string;
    kind: AlertKind;
    threshold: number;
  }[]
): Promise<AlertsResult> {
  const uid = await getCurrentUserId();
  if (!isDatabaseConfigured()) {
    return { db: false, alerts: [] };
  }

  try {
    const db = getDb();
    const existing = await db
      .select()
      .from(priceAlerts)
      .where(eq(priceAlerts.userId, uid));
    const have = new Set(
      existing.map((r) => `${r.symbol.toUpperCase()}|${r.condition}`)
    );

    const toInsert = incoming
      .filter(
        (a) =>
          a.symbol &&
          a.kind &&
          Number.isFinite(a.threshold) &&
          !have.has(`${a.symbol.toUpperCase()}|${a.kind}`)
      )
      .slice(0, 50);

    if (toInsert.length) {
      await db.insert(priceAlerts).values(
        toInsert.map((a) => ({
          userId: uid,
          symbol: a.symbol.toUpperCase(),
          displaySymbol: a.displaySymbol || a.symbol,
          targetPrice: String(a.threshold),
          condition: a.kind,
          isTriggered: false,
        }))
      );
    }

    return getUserAlerts(uid);
  } catch (error) {
    console.error('Failed to migrate anonymous alerts:', error);
    return getUserAlerts(uid).catch(() => ({ db: false, alerts: [] }));
  }
}
