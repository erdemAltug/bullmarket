import 'server-only';
import { and, eq, gte, inArray } from 'drizzle-orm';
import { getDb } from '@/db';
import { marketScores, portfolioTransactions, priceAlerts, scoreHistory } from '@/db/schema';
import { fetchTickers } from '@/lib/api/binance';
import { DEFAULT_FX_CODES, fetchFxRates } from '@/lib/api/tcmb';
import { fetchFundamentals, fetchQuotes } from '@/lib/api/yahoo';
import { istanbulDay } from '@/lib/score-scan';
import { BIST_SECTORS, US_SECTORS } from '@/lib/seo/sectors';
import type { AssetClass } from '@/types';

export type ReportTone = 'good' | 'info' | 'watch';

export interface ReportFinding {
  tone: ReportTone;
  title: string;
  body: string;
}

export interface ReportHolding {
  symbol: string;
  display: string;
  name: string;
  assetClass: AssetClass;
  currency: 'TRY' | 'USD';
  quantity: number;
  valueTry: number;
  costTry: number;
  pnlPct: number;
  weight: number;
  sector: string;
  score: number | null;
  scoreChange7d: number | null;
  targetUpsidePct: number | null;
  hasAlert: boolean;
}

export interface PortfolioReport {
  generatedAt: string;
  totalTry: number;
  costTry: number;
  pnlTry: number;
  pnlPct: number;
  holdings: ReportHolding[];
  byClass: { label: string; weight: number }[];
  bySector: { label: string; weight: number }[];
  currency: { tryPct: number; usdPct: number };
  cashPct: number;
  topWeight: number;
  /** Herfindahl index of weights, 0–1; 1 = everything in one position. */
  concentration: number;
  weightedTargetUpsidePct: number | null;
  findings: ReportFinding[];
}

const CLASS_LABEL: Record<AssetClass, string> = {
  bist: 'Hisse',
  crypto: 'Kripto',
  gold: 'Altın',
  cash: 'Nakit',
  deposit: 'Mevduat',
};

function displayOf(symbol: string) {
  return symbol.replace('.IS', '').replace('USDT', '');
}

function sectorOf(symbol: string, cls: AssetClass) {
  if (cls === 'crypto') return 'Kripto';
  if (cls === 'gold') return 'Altın';
  if (cls === 'cash' || cls === 'deposit') return 'Nakit ve mevduat';
  const d = displayOf(symbol);
  const isBist = symbol.endsWith('.IS');
  const list = isBist ? BIST_SECTORS : US_SECTORS;
  return list.find((s) => s.symbols.includes(d))?.name ?? (isBist ? 'Diğer BİST' : 'Diğer ABD');
}

function parseDeposit(notes: string | null): { rate: number; days: number | null } | null {
  if (!notes) return null;
  try {
    const o = JSON.parse(notes) as { rate?: number; days?: number | null };
    return typeof o.rate === 'number' ? { rate: o.rate, days: o.days ?? null } : null;
  } catch {
    return null;
  }
}

function fmtPct(n: number) {
  return `%${Math.abs(n).toLocaleString('tr-TR', { maximumFractionDigits: 1 })}`;
}

/** Builds the weekly portfolio check-up for one user from stored positions. */
export async function buildPortfolioReport(
  userId: string,
  /** Test hook: positions to use instead of reading the user's rows. */
  rowsOverride?: (typeof portfolioTransactions.$inferSelect)[]
): Promise<PortfolioReport | null> {
  const db = getDb();
  const rows =
    rowsOverride ??
    (await db.select().from(portfolioTransactions).where(eq(portfolioTransactions.userId, userId)));
  if (!rows.length) return null;

  const market = rows.filter((r) => r.assetClass === 'bist' || r.assetClass === 'crypto');
  const symbols = [...new Set(market.map((r) => r.symbol))];
  const since = istanbulDay(new Date(Date.now() - 7 * 86_400_000));

  const [fx, scoreRows, histRows, alertRows] = await Promise.all([
    fetchFxRates(DEFAULT_FX_CODES).catch(() => ({ rates: [] as { code: string; forexSelling: number }[] })),
    symbols.length
      ? db.select().from(marketScores).where(inArray(marketScores.symbol, symbols))
      : Promise.resolve([]),
    symbols.length
      ? db
          .select({ symbol: scoreHistory.symbol, day: scoreHistory.day, score: scoreHistory.score })
          .from(scoreHistory)
          .where(and(inArray(scoreHistory.symbol, symbols), gte(scoreHistory.day, since)))
      : Promise.resolve([]),
    db.select({ symbol: priceAlerts.symbol }).from(priceAlerts).where(eq(priceAlerts.userId, userId)),
  ]);

  const usdTry = fx.rates.find((r) => r.code === 'USD')?.forexSelling || 0;
  const goldTry = fx.rates.find((r) => r.code === 'GOLD')?.forexSelling || 0;
  const scoreBy = new Map(scoreRows.map((r) => [r.symbol, r]));

  // Prices: the 15-minute scan first, then a direct quote for anything missing.
  const price = new Map<string, number>();
  for (const r of scoreRows) price.set(r.symbol, r.price);
  const missingStocks = symbols.filter((s) => !price.has(s) && !s.endsWith('USDT'));
  const missingCrypto = symbols.filter((s) => !price.has(s) && s.endsWith('USDT'));
  const [quotes, tickers] = await Promise.all([
    missingStocks.length ? fetchQuotes(missingStocks).catch(() => []) : Promise.resolve([]),
    missingCrypto.length ? fetchTickers(missingCrypto).catch(() => []) : Promise.resolve([]),
  ]);
  for (const q of quotes) if (q.price > 0) price.set(q.symbol, q.price);
  for (const t of tickers) if (t.price > 0) price.set(t.symbol, t.price);

  // Analyst targets for up to 12 stock positions (slow call, so capped).
  const stockSyms = symbols.filter((s) => !s.endsWith('USDT')).slice(0, 12);
  const targets = new Map<string, number>();
  await Promise.all(
    stockSyms.map(async (s) => {
      const f = await fetchFundamentals(s).catch(() => null);
      const t = f?.analyst?.targetMean;
      if (t && t > 0) targets.set(s, t);
    })
  );

  const hist = new Map<string, { day: string; score: number }[]>();
  for (const h of histRows) {
    const list = hist.get(h.symbol) ?? [];
    list.push({ day: String(h.day), score: h.score });
    hist.set(h.symbol, list);
  }
  const alerted = new Set(alertRows.map((a) => a.symbol));
  const toTry = (v: number, usd: boolean) => (usd ? v * (usdTry || 1) : v);

  // Merge lots of the same symbol into one holding.
  const merged = new Map<string, ReportHolding>();
  for (const r of rows) {
    const cls = r.assetClass as AssetClass;
    const qty = Number(r.quantity);
    const buy = Number(r.buyPrice);
    const usd = r.currency === 'USD' || cls === 'crypto';
    let value: number;
    if (cls === 'cash') value = buy * qty;
    else if (cls === 'deposit') {
      const dep = parseDeposit(r.notes);
      const days = Math.max(0, (Date.now() - r.boughtAt.getTime()) / 86_400_000);
      const used = Math.min(days, dep?.days ?? 365);
      value = buy * qty * (1 + ((dep?.rate ?? 0) / 100) * (used / 365));
    } else if (cls === 'gold') value = (goldTry || buy) * qty;
    else value = toTry((price.get(r.symbol) ?? buy) * qty, usd);
    const cost = cls === 'gold' || cls === 'cash' || cls === 'deposit' ? buy * qty : toTry(buy * qty, usd);

    const key = `${cls}:${r.symbol}`;
    const prev = merged.get(key);
    const live = price.get(r.symbol);
    const target = targets.get(r.symbol);
    const series = (hist.get(r.symbol) ?? []).sort((a, b) => a.day.localeCompare(b.day));
    const scoreNow = scoreBy.get(r.symbol)?.score ?? null;
    const change7 = series.length >= 2 && scoreNow != null ? scoreNow - series[0].score : null;
    merged.set(key, {
      symbol: r.symbol,
      display: displayOf(r.symbol),
      name: r.name || displayOf(r.symbol),
      assetClass: cls,
      currency: usd ? 'USD' : 'TRY',
      quantity: (prev?.quantity ?? 0) + qty,
      valueTry: (prev?.valueTry ?? 0) + value,
      costTry: (prev?.costTry ?? 0) + cost,
      pnlPct: 0,
      weight: 0,
      sector: sectorOf(r.symbol, cls),
      score: scoreNow,
      scoreChange7d: change7,
      targetUpsidePct: target && live ? ((target - live) / live) * 100 : null,
      hasAlert: alerted.has(r.symbol),
    });
  }

  const holdings = [...merged.values()];
  const total = holdings.reduce((a, h) => a + h.valueTry, 0);
  const cost = holdings.reduce((a, h) => a + h.costTry, 0);
  for (const h of holdings) {
    h.weight = total > 0 ? h.valueTry / total : 0;
    h.pnlPct = h.costTry > 0 ? ((h.valueTry - h.costTry) / h.costTry) * 100 : 0;
  }
  holdings.sort((a, b) => b.valueTry - a.valueTry);

  const group = (key: (h: ReportHolding) => string) => {
    const m = new Map<string, number>();
    for (const h of holdings) m.set(key(h), (m.get(key(h)) ?? 0) + h.weight);
    return [...m.entries()].map(([label, weight]) => ({ label, weight })).sort((a, b) => b.weight - a.weight);
  };
  const byClass = group((h) => CLASS_LABEL[h.assetClass]);
  const bySector = group((h) => h.sector);
  const usdPct = holdings.filter((h) => h.currency === 'USD').reduce((a, h) => a + h.weight, 0);
  const cashPct = holdings
    .filter((h) => h.assetClass === 'cash' || h.assetClass === 'deposit')
    .reduce((a, h) => a + h.weight, 0);
  const topWeight = holdings[0]?.weight ?? 0;
  const concentration = holdings.reduce((a, h) => a + h.weight ** 2, 0);
  const withTarget = holdings.filter((h) => h.targetUpsidePct != null);
  const targetWeight = withTarget.reduce((a, h) => a + h.weight, 0);
  const weightedTargetUpsidePct = targetWeight
    ? withTarget.reduce((a, h) => a + h.weight * (h.targetUpsidePct as number), 0) / targetWeight
    : null;

  // Plain-language observations. They describe the portfolio; no buy/sell.
  const findings: ReportFinding[] = [];
  const top = holdings[0];
  if (top && topWeight >= 0.35 && holdings.length > 1) {
    findings.push({
      tone: 'watch',
      title: 'Tek bir varlığa yoğunlaşma var',
      body: `${top.display} portföyünde ${fmtPct(topWeight * 100)} paya sahip. Bu varlıkta yüzde 10’luk bir hareket, toplam portföyünü yaklaşık ${fmtPct(topWeight * 10)} etkiler.`,
    });
  } else if (holdings.length >= 4) {
    findings.push({
      tone: 'good',
      title: 'Dağılım dengeli',
      body: `En büyük pozisyonun ağırlığı ${fmtPct(topWeight * 100)}. Tek bir varlığın portföyü sarsma riski sınırlı.`,
    });
  }
  const topSector = bySector[0];
  if (topSector && topSector.weight >= 0.5 && bySector.length > 1) {
    findings.push({
      tone: 'watch',
      title: `${topSector.label} ağırlığı yüksek`,
      body: `Bu sektörün portföyündeki payı ${fmtPct(topSector.weight * 100)}. Sektörü etkileyen bir haber, pozisyonlarının çoğunu birlikte hareket ettirebilir.`,
    });
  }
  if (cashPct < 0.05 && total > 0) {
    findings.push({
      tone: 'info',
      title: 'Nakit tamponu yok denecek kadar az',
      body: `Nakit ve mevduat payın ${fmtPct(cashPct * 100)}. Acil bir ihtiyaçta düşen bir varlığı satmak zorunda kalmamak için birçok yatırımcı birkaç aylık gideri kenarda tutar.`,
    });
  } else if (cashPct > 0.6) {
    findings.push({
      tone: 'info',
      title: 'Portföyünün çoğu nakitte',
      body: `Nakit ve mevduat payın ${fmtPct(cashPct * 100)}. Mevduat faizini enflasyonla karşılaştırarak reel getiriyi takip etmek faydalı.`,
    });
  }
  if (usdPct > 0) {
    findings.push({
      tone: 'info',
      title: 'Döviz dağılımı',
      body: `Dolar bazlı payın ${fmtPct(usdPct * 100)} (ABD hissesi ve kripto), TL bazlı payın ${fmtPct((1 - usdPct) * 100)}. Dolar/TL hareketi dolar bazlı kısmın TL değerini doğrudan etkiler.`,
    });
  }
  const losers = holdings.filter((h) => h.pnlPct <= -20 && h.assetClass !== 'cash' && h.assetClass !== 'deposit');
  if (losers.length) {
    findings.push({
      tone: 'watch',
      title: 'Maliyetinin belirgin altında olanlar',
      body: `${losers.map((h) => `${h.display} (${fmtPct(h.pnlPct)} zararda)`).join(', ')}. Alırken belirlediğin planla karşılaştırmak için iyi bir zaman.`,
    });
  }
  const noAlert = holdings.filter((h) => (h.assetClass === 'bist' || h.assetClass === 'crypto') && !h.hasAlert);
  if (noAlert.length) {
    findings.push({
      tone: 'info',
      title: `${noAlert.length} pozisyonda alarm yok`,
      body: `${noAlert.slice(0, 5).map((h) => h.display).join(', ')}${noAlert.length > 5 ? ' ve diğerleri' : ''} için fiyat alarmı kurarsan önemli bir hareket olduğunda e-postayla haber veririz.`,
    });
  }
  const drops = holdings.filter((h) => (h.scoreChange7d ?? 0) <= -15);
  const rises = holdings.filter((h) => (h.scoreChange7d ?? 0) >= 15);
  if (drops.length || rises.length) {
    findings.push({
      tone: drops.length ? 'watch' : 'good',
      title: 'Bu hafta skoru belirgin değişenler',
      body: [
        rises.length ? `Yükselen: ${rises.map((h) => `${h.display} (+${h.scoreChange7d})`).join(', ')}` : '',
        drops.length ? `Düşen: ${drops.map((h) => `${h.display} (${h.scoreChange7d})`).join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('. ') + '.',
    });
  }
  if (weightedTargetUpsidePct != null) {
    findings.push({
      tone: 'info',
      title: 'Analist hedeflerine göre',
      body: `Hedef fiyatı olan pozisyonlarında aracı kurum konsensüsü, mevcut fiyatın ortalama ${weightedTargetUpsidePct >= 0 ? `${fmtPct(weightedTargetUpsidePct)} üzerinde` : `${fmtPct(weightedTargetUpsidePct)} altında`}. Hedefler tahmindir, garanti değildir.`,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    totalTry: total,
    costTry: cost,
    pnlTry: total - cost,
    pnlPct: cost > 0 ? ((total - cost) / cost) * 100 : 0,
    holdings,
    byClass,
    bySector,
    currency: { tryPct: 1 - usdPct, usdPct },
    cashPct,
    topWeight,
    concentration,
    weightedTargetUpsidePct,
    findings,
  };
}
