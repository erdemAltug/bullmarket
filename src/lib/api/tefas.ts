import { appCache } from '@/lib/cache';
import { periodStartFor, type ChartTimeframe } from '@/lib/chart-timeframes';
import type { HistoricalPricePoint } from '@/types';

const INFO_URL = 'https://www.tefas.gov.tr/api/funds/fonGnlBlgSiraliGetir';

export type TefasFundKind = 'YAT' | 'EMK' | 'BYF' | 'GYF' | 'GSYF';

export interface TefasFundRow {
  code: string;
  name: string;
  date: string;
  price: number;
  sharesOutstanding: number | null;
  investorCount: number | null;
  portfolioSize: number | null;
  exchangePrice: number | null;
  kind: TefasFundKind;
}

interface TefasApiRow {
  fonKodu?: string;
  fonUnvan?: string;
  tarih?: string;
  fiyat?: number;
  tedPaySayisi?: number;
  kisiSayisi?: number;
  portfoyBuyukluk?: number;
  borsaBultenFiyat?: number | null;
}

function yyyymmdd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function previousWeekday(from: Date): Date {
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  do {
    d.setDate(d.getDate() - 1);
  } while (d.getDay() === 0 || d.getDay() === 6);
  return d;
}

function recentWeekdays(count = 6): Date[] {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (out.length < count) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      out.push(new Date(d));
    }
    d.setDate(d.getDate() - 1);
  }
  return out;
}

export async function postInfo(
  kind: TefasFundKind,
  start: Date,
  end: Date,
  fundCode?: string
): Promise<TefasFundRow[]> {
  const body = {
    fonTipi: kind,
    fonKodu: fundCode ? fundCode.toUpperCase() : null,
    aramaMetni: null,
    fonTurKod: null,
    fonGrubu: null,
    sfonTurKod: null,
    fonTurAciklama: null,
    kurucuKod: null,
    basTarih: yyyymmdd(start),
    bitTarih: yyyymmdd(end),
    basSira: 1,
    bitSira: 100000,
    dil: 'TR',
    sFonTurKod: '',
    fonKod: '',
    fonGrup: '',
    fonUnvanTip: '',
  };

  const res = await fetch(INFO_URL, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
      Origin: 'https://www.tefas.gov.tr',
      Referer: 'https://www.tefas.gov.tr/tr/fon-verileri',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
    },
    body: JSON.stringify(body),
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`TEFAS HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    errorCode?: string | null;
    errorMessage?: string | null;
    resultList?: TefasApiRow[] | null;
  };

  const err = data.errorMessage ?? '';
  if (err && /out of bounds|veri bulunamadı/i.test(err)) {
    return [];
  }
  if ((data.errorCode || data.errorMessage) && !data.resultList?.length) {
    throw new Error(data.errorMessage || 'TEFAS API error');
  }

  return (data.resultList ?? [])
    .filter((r) => r.fonKodu && r.fiyat != null && r.fiyat > 0)
    .map((r) => ({
      code: String(r.fonKodu).toUpperCase(),
      name: r.fonUnvan || String(r.fonKodu),
      date: r.tarih || yyyymmdd(start),
      price: Number(r.fiyat),
      sharesOutstanding: r.tedPaySayisi ?? null,
      investorCount: r.kisiSayisi ?? null,
      portfolioSize: r.portfoyBuyukluk ?? null,
      exchangePrice: r.borsaBultenFiyat ?? null,
      kind,
    }));
}

/** Latest TEFAS snapshot + previous session for daily change (cached ~5 min). */
export async function fetchTefasLatest(
  codes: readonly string[],
  kind: TefasFundKind = 'YAT'
): Promise<
  Array<
    TefasFundRow & {
      prevPrice: number | null;
      changePercent: number;
    }
  >
> {
  const want = new Set(codes.map((c) => c.toUpperCase()));
  const cacheKey = `tefas:latest:${kind}:${[...want].sort().join(',')}`;
  const hit = appCache.get<
    Array<TefasFundRow & { prevPrice: number | null; changePercent: number }>
  >(cacheKey);
  if (hit) return hit;

  let latest: TefasFundRow[] = [];
  let latestDay: Date | null = null;
  for (const day of recentWeekdays(6)) {
    const rows = (await postInfo(kind, day, day)).filter((r) =>
      want.has(r.code)
    );
    if (rows.length) {
      latest = rows;
      latestDay = day;
      break;
    }
  }

  if (!latest.length || !latestDay) return [];

  const prevDay = previousWeekday(latestDay);
  const prevRows = await postInfo(kind, prevDay, prevDay).catch(() => []);
  const prevMap = new Map(prevRows.map((r) => [r.code, r.price]));

  const merged = latest.map((row) => {
    const prevPrice = prevMap.get(row.code) ?? null;
    const changePercent =
      prevPrice && prevPrice > 0
        ? ((row.price - prevPrice) / prevPrice) * 100
        : 0;
    return { ...row, prevPrice, changePercent };
  });

  appCache.set(cacheKey, merged, 300);
  return merged;
}

const FUND_KINDS: TefasFundKind[] = ['YAT', 'EMK', 'BYF'];
// TEFAS rejects ranges over one month ("Tarih aralığı 1 ayı aşamaz").
const WINDOW_DAYS = 28;
const PARALLEL = 6;

/**
 * Daily price history for one TEFAS fund. TEFAS accepts at most one month
 * per request, so longer ranges are fetched in 28-day chunks (6 at a time,
 * up to 2 years) and cached for 6 hours — fund prices change once a day.
 */
export async function fetchTefasHistory(
  code: string,
  timeframe: ChartTimeframe
): Promise<HistoricalPricePoint[]> {
  const fund = code.toUpperCase();
  const cacheKey = `tefas:hist:${fund}:${timeframe}`;
  const hit = appCache.get<HistoricalPricePoint[]>(cacheKey);
  if (hit) return hit;

  const end = new Date();
  let start = periodStartFor(timeframe);
  // Cap at 2 years: ~26 requests on a cold cache is the most we spend.
  const floor = new Date(end);
  floor.setFullYear(floor.getFullYear() - 2);
  if (start < floor) start = floor;

  const windows: [Date, Date][] = [];
  for (let s = new Date(start); s < end; ) {
    const e = new Date(s);
    e.setDate(e.getDate() + WINDOW_DAYS);
    windows.push([new Date(s), e > end ? end : e]);
    s = new Date(e);
    s.setDate(s.getDate() + 1);
  }

  let points: HistoricalPricePoint[] = [];
  for (const kind of FUND_KINDS) {
    const rows: TefasFundRow[] = [];
    // Newest window first: if the fund isn't this kind we learn it in one round.
    const ordered = [...windows].reverse();
    for (let i = 0; i < ordered.length; i += PARALLEL) {
      const batch = await Promise.all(
        ordered
          .slice(i, i + PARALLEL)
          .map(([a, b]) => postInfo(kind, a, b, fund).catch(() => [] as TefasFundRow[]))
      );
      for (const r of batch) rows.push(...r);
      if (i === 0 && rows.length === 0) break; // not this fund kind
    }
    if (rows.length) {
      const byDay = new Map<number, HistoricalPricePoint>();
      for (const r of rows) {
        if (r.code !== fund) continue;
        const ts = parseTefasDate(r.date);
        if (ts != null) byDay.set(ts, { timestamp: ts, price: r.price });
      }
      points = [...byDay.values()].sort((a, b) => a.timestamp - b.timestamp);
      break;
    }
  }

  appCache.set(cacheKey, points, points.length ? 6 * 3600 : 600);
  return points;
}

/** TEFAS sends dates as epoch ms strings, YYYYMMDD or DD.MM.YYYY. */
function parseTefasDate(raw: string): number | null {
  if (/^\d{12,}$/.test(raw)) return Number(raw);
  const ymd = /^(\d{4})(\d{2})(\d{2})$/.exec(raw);
  if (ymd) return Date.UTC(+ymd[1], +ymd[2] - 1, +ymd[3], 12);
  const dmy = /^(\d{2})\.(\d{2})\.(\d{4})/.exec(raw);
  if (dmy) return Date.UTC(+dmy[3], +dmy[2] - 1, +dmy[1], 12);
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : null;
}
