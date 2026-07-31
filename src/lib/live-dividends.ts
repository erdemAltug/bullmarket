import { BIST30_SYMBOLS, fetchDividendSnapshot } from '@/lib/api/yahoo';

export interface LiveDividendItem {
  symbol: string;
  displaySymbol: string;
  name: string;
  price: number;
  currency: string;
  netPerShare: number;
  dividendYield: number;
  exDate: string | null;
  payDate: string | null;
  category: 'BIST30';
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    out.push(...(await Promise.all(chunk.map(fn))));
  }
  return out;
}

/** Live BİST dividend yields & ex-dates from Yahoo Finance */
export async function fetchLiveDividends(): Promise<LiveDividendItem[]> {
  const symbols = BIST30_SYMBOLS.filter((s) => !s.startsWith('XU'));

  const rows = await mapPool(symbols, 4, async (sym) => {
    const snap = await fetchDividendSnapshot(sym);
    if (!snap) return null;
    const yieldPct = snap.dividendYield ?? 0;
    const rate =
      snap.dividendRate ??
      snap.trailingAnnualDividendRate ??
      (snap.price > 0 && yieldPct > 0
        ? (snap.price * yieldPct) / 100
        : 0);

    // Only include names with real dividend signal
    if (yieldPct <= 0 && rate <= 0 && !snap.exDividendDate) return null;

    return {
      symbol: snap.symbol,
      displaySymbol: snap.symbol.replace('.IS', ''),
      name: snap.name,
      price: snap.price,
      currency: snap.currency,
      netPerShare: rate,
      dividendYield: yieldPct,
      exDate: snap.exDividendDate,
      payDate: null as string | null,
      category: 'BIST30' as const,
    };
  });

  return rows
    .filter((r): r is LiveDividendItem => r != null)
    .sort((a, b) => b.dividendYield - a.dividendYield);
}
