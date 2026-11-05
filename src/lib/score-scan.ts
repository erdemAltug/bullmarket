import 'server-only';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { marketScores, scoreHistory } from '@/db/schema';
import { scoreOpportunity } from '@/lib/ai-opportunity';
import { getBistBoard, getLiveMarketItems } from '@/lib/market-live';
import type { ScannerItem } from '@/types/scanner';

const CHUNK = 200;
const SCORED = new Set(['BIST', 'US', 'CRYPTO', 'ETF', 'FON']);

/** Istanbul calendar day, YYYY-MM-DD. */
export function istanbulDay(d = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(d);
}

/** Full universe: live tape plus the whole BİST board, de-duplicated. */
async function loadUniverse(): Promise<ScannerItem[]> {
  const [live, board] = await Promise.all([
    getLiveMarketItems(),
    getBistBoard().catch(() => ({ items: [] as ScannerItem[] })),
  ]);
  const map = new Map<string, ScannerItem>();
  for (const item of [...board.items, ...live.items]) {
    if (!SCORED.has(item.category) || !(item.price > 0)) continue;
    if (item.displaySymbol.startsWith('XU')) continue;
    map.set(item.symbol, item);
  }
  return [...map.values()];
}

export type ScanResult = { scanned: number; day: string; ms: number };

/** Scores the universe and writes latest + daily history. */
export async function runScoreScan(): Promise<ScanResult> {
  const t0 = Date.now();
  const db = getDb();
  const day = istanbulDay();
  const now = new Date();
  const items = await loadUniverse();

  const rows = items.map((item) => ({
    symbol: item.symbol,
    displaySymbol: item.displaySymbol,
    name: item.name ?? '',
    category: item.category,
    score: Math.round(scoreOpportunity(item)),
    price: item.price,
    changePercent: Number.isFinite(item.changePercent) ? item.changePercent : 0,
    updatedAt: now,
  }));

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    await db
      .insert(marketScores)
      .values(chunk)
      .onConflictDoUpdate({
        target: marketScores.symbol,
        set: {
          displaySymbol: sql`excluded.display_symbol`,
          name: sql`excluded.name`,
          category: sql`excluded.category`,
          score: sql`excluded.score`,
          price: sql`excluded.price`,
          changePercent: sql`excluded.change_percent`,
          updatedAt: sql`excluded.updated_at`,
        },
      });
    await db
      .insert(scoreHistory)
      .values(chunk.map((r) => ({ symbol: r.symbol, day, score: r.score, price: r.price, updatedAt: now })))
      .onConflictDoUpdate({
        target: [scoreHistory.symbol, scoreHistory.day],
        set: {
          score: sql`excluded.score`,
          price: sql`excluded.price`,
          updatedAt: sql`excluded.updated_at`,
        },
      });
  }

  return { scanned: rows.length, day, ms: Date.now() - t0 };
}

/** Daily score series for one symbol, oldest first. */
export async function getScoreHistory(symbol: string, days = 90) {
  const db = getDb();
  const since = istanbulDay(new Date(Date.now() - days * 86_400_000));
  const rows = await db
    .select({ day: scoreHistory.day, score: scoreHistory.score, price: scoreHistory.price })
    .from(scoreHistory)
    .where(and(eq(scoreHistory.symbol, symbol), gte(scoreHistory.day, since)))
    .orderBy(scoreHistory.day);
  return rows;
}

/** Top latest scores, optionally per category. */
export async function getTopScores(limit = 20, category?: string) {
  const db = getDb();
  const q = db.select().from(marketScores);
  const filtered = category ? q.where(eq(marketScores.category, category)) : q;
  return filtered.orderBy(desc(marketScores.score)).limit(limit);
}
