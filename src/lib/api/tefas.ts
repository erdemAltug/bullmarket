import { appCache } from '@/lib/cache';

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

async function postInfo(
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
