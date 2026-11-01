import { and, eq, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/db';
import { priceAlerts } from '@/db/schema';
import { scoreOpportunity } from '@/lib/ai-opportunity';
import {
  alertKindLabel,
  describeAlertHit,
  evaluateAlert,
  indexSnap,
  lookupSnap,
  type LiveQuoteSnap,
} from '@/lib/alert-eval';
import { fetchKlines } from '@/lib/api/binance';
import { fetchCommodities } from '@/lib/api/commodities';
import { DEFAULT_FX_CODES, fetchFxRates } from '@/lib/api/tcmb';
import { fetchHistory } from '@/lib/api/yahoo';
import { captureServerEvent } from '@/lib/analytics-server';
import { isEmailConfigured, sendAlertEmail } from '@/lib/email/resend';
import { rsi } from '@/lib/indicators';
import { getLiveMarketItems } from '@/lib/market-live';
import { SITE_URL } from '@/lib/seo/symbols';
import type { AlertKind } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_RSI_SYMBOLS = 40;

async function rsiFor(symbol: string): Promise<number | null> {
  try {
    const pts = symbol.endsWith('USDT')
      ? await fetchKlines(symbol, '6M')
      : await fetchHistory(symbol, '6M');
    return rsi(
      pts.map((p) => p.price),
      14
    );
  } catch {
    return null;
  }
}

/** Same quote universe the in-browser AlertEngine watches. */
async function buildSnapshots(rsiSymbols: string[]) {
  const [market, commodities, fx, rsiRows] = await Promise.all([
    getLiveMarketItems(),
    fetchCommodities().catch(() => []),
    fetchFxRates(DEFAULT_FX_CODES).catch(() => ({ rates: [] })),
    Promise.all(
      rsiSymbols.slice(0, MAX_RSI_SYMBOLS).map(async (s) => [s.toUpperCase(), await rsiFor(s)] as const)
    ),
  ]);
  const rsiMap = new Map(rsiRows);
  const map = new Map<string, LiveQuoteSnap>();

  for (const item of market.items) {
    indexSnap(map, {
      symbol: item.symbol,
      displaySymbol: item.displaySymbol,
      price: item.price,
      changePercent: item.changePercent,
      rsi: rsiMap.get(item.symbol.toUpperCase()) ?? null,
      score: scoreOpportunity(item),
    });
  }
  for (const c of commodities) {
    indexSnap(map, {
      symbol: c.symbol,
      displaySymbol: c.name,
      price: c.price,
      changePercent: c.changePercent,
      rsi: null,
    });
  }
  for (const r of fx.rates) {
    const snap = {
      symbol: r.code,
      displaySymbol: `${r.code}/TRY`,
      price: r.forexSelling,
      changePercent: 0,
      rsi: null,
    };
    indexSnap(map, snap);
    if (r.code === 'USD') indexSnap(map, { ...snap, symbol: 'USDTRY', displaySymbol: 'USD/TRY' });
  }
  return map;
}

/**
 * Checks every saved alert against live data so e-mails go out with the tab
 * closed. Called by .github/workflows/alerts-cron.yml every 10 minutes.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: true, skipped: true });
  }

  const db = getDb();
  const alerts = await db.select().from(priceAlerts);
  if (!alerts.length) {
    return NextResponse.json({ success: true, checked: 0 });
  }

  const rsiSymbols = [
    ...new Set(
      alerts
        .filter((a) => a.condition === 'rsi_above' || a.condition === 'rsi_below')
        .map((a) => a.symbol)
    ),
  ];
  const snaps = await buildSnapshots(rsiSymbols);
  const emailOn = isEmailConfigured();

  let sent = 0;
  let rearmed = 0;
  let noData = 0;

  for (const row of alerts) {
    const alert = {
      symbol: row.symbol,
      displaySymbol: row.displaySymbol,
      kind: row.condition as AlertKind,
      threshold: Number(row.targetPrice),
    };
    const snap = lookupSnap(snaps, alert);
    if (!snap) {
      noData++;
      continue;
    }
    const hit = evaluateAlert(alert, snap);

    if (!hit) {
      if (row.isTriggered || row.notifiedAt) {
        await db
          .update(priceAlerts)
          .set({ isTriggered: false, notifiedAt: null })
          .where(eq(priceAlerts.id, row.id));
        rearmed++;
      }
      continue;
    }

    if (row.notifiedAt) continue;
    const claimed = await db
      .update(priceAlerts)
      .set({ isTriggered: true, notifiedAt: new Date() })
      .where(and(eq(priceAlerts.id, row.id), isNull(priceAlerts.notifiedAt)))
      .returning({ id: priceAlerts.id });
    if (!claimed.length || !emailOn || !row.email) continue;

    const result = await sendAlertEmail({
      to: row.email,
      displaySymbol: row.displaySymbol,
      kindLabel: alertKindLabel(alert.kind),
      detail: describeAlertHit(alert, snap),
      href: `${SITE_URL}/alerts?utm_source=email&utm_medium=alert`,
    });
    if (result.ok) {
      sent++;
      await captureServerEvent('alert_email_sent', row.userId, {
        kind: alert.kind,
        symbol: row.displaySymbol,
        source: 'cron',
      });
    } else {
      // Release the claim so the next run retries.
      await db
        .update(priceAlerts)
        .set({ notifiedAt: null })
        .where(eq(priceAlerts.id, row.id));
    }
  }

  return NextResponse.json({
    success: true,
    checked: alerts.length,
    sent,
    rearmed,
    noData,
  });
}
