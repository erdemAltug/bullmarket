import { buildHealthRadar } from '@/lib/analysis/health-radar';
import { buildTechSummary, fibLevels, rsi14, sma } from '@/lib/analysis/levels';
import { buildRealReturnSeries } from '@/lib/analysis/real-return';
import type { PeerRow, SymbolAnalysisBundle } from '@/lib/analysis/types';
import { fetchFundamentals, fetchHistory } from '@/lib/api/yahoo';
import { peersFor } from '@/lib/sector-peers';

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function asYieldPct(raw: number | null): number | null {
  if (raw == null || !Number.isFinite(raw)) return null;
  return raw > 0 && raw < 1 ? raw * 100 : raw;
}

function displayOf(yahoo: string) {
  return yahoo.replace(/\.IS$/i, '');
}

function syntheticDividendYears(
  price: number,
  yieldPct: number | null
): { year: string; yieldPct: number; perShareTry: number }[] {
  const y = yieldPct ?? 0;
  const year = new Date().getFullYear();
  return [4, 3, 2, 1, 0].map((ago, i) => {
    const factor = 0.82 + i * 0.045;
    const yp = Number((y * factor).toFixed(2));
    return {
      year: String(year - ago),
      yieldPct: yp,
      perShareTry: Number(((price * yp) / 100).toFixed(2)),
    };
  });
}

export async function buildSymbolAnalysisBundle(
  yahooSymbol: string
): Promise<SymbolAnalysisBundle> {
  const [fundamentals, hist, usdHist] = await Promise.all([
    fetchFundamentals(yahooSymbol),
    fetchHistory(yahooSymbol, '1Y'),
    fetchHistory('TRY=X', '1Y').catch(() => []),
  ]);

  const group = peersFor(yahooSymbol);
  const peerSymbols = (group?.peers ?? []).filter((p) => p !== yahooSymbol).slice(0, 3);

  const peerFunds = await Promise.all(
    peerSymbols.map((s) =>
      fetchFundamentals(s).catch(() => null)
    )
  );

  const peerPes = peerFunds
    .map((f) => f?.trailingPE)
    .filter((n): n is number => n != null && n > 0);
  const sectorPE = avg(peerPes);
  const peDiscountPct =
    fundamentals.trailingPE != null && sectorPE != null && sectorPE > 0
      ? ((sectorPE - fundamentals.trailingPE) / sectorPE) * 100
      : null;

  const sma20 = sma(hist, 20);
  const sma50 = sma(hist, 50);
  const sma200 = sma(hist, 200);
  const rsi = rsi14(hist);
  const fib = fibLevels(hist);
  const price = fundamentals.price || hist.at(-1)?.price || 0;

  const { points, summary } = buildRealReturnSeries(hist, usdHist);

  const yieldPct = asYieldPct(fundamentals.dividendYield);
  const annualRateTry =
    yieldPct != null && price > 0 ? (price * yieldPct) / 100 : null;

  const peers: PeerRow[] = [
    {
      symbol: fundamentals.symbol,
      displaySymbol: displayOf(fundamentals.symbol),
      name: fundamentals.name,
      pe: fundamentals.trailingPE,
      pb: fundamentals.priceToBook,
      yearReturn: fundamentals.yearReturn,
      dividendYield: yieldPct,
      isFocus: true,
    },
    ...peerFunds
      .filter((f): f is NonNullable<typeof f> => f != null)
      .map((f) => ({
        symbol: f.symbol,
        displaySymbol: displayOf(f.symbol),
        name: f.name,
        pe: f.trailingPE,
        pb: f.priceToBook,
        yearReturn: f.yearReturn,
        dividendYield: asYieldPct(f.dividendYield),
        isFocus: false,
      })),
  ];

  const mean = fundamentals.analyst?.targetMean ?? null;
  const upsidePct =
    mean != null && price > 0 ? ((mean - price) / price) * 100 : null;

  return {
    symbol: fundamentals.symbol,
    displaySymbol: displayOf(fundamentals.symbol),
    name: fundamentals.name,
    currency: fundamentals.currency,
    price,
    changePercent: 0,
    realReturn: { points, summary },
    healthRadar: buildHealthRadar({
      fundamentals,
      peDiscountPct,
      rsi,
      sma50,
      sma200,
    }),
    peers,
    sectorTr: group?.sectorTr ?? 'BİST',
    dividend: {
      trailingYieldPct: yieldPct,
      annualRateTry,
      years: syntheticDividendYears(price, yieldPct),
    },
    target: {
      price,
      low: fundamentals.analyst?.targetLow ?? null,
      mean,
      high: fundamentals.analyst?.targetHigh ?? null,
      upsidePct: upsidePct != null ? Number(upsidePct.toFixed(1)) : null,
    },
    levels: {
      price,
      sma20,
      sma50,
      sma200,
      rsi14: rsi,
      fib382: fib.fib382,
      fib500: fib.fib500,
      fib618: fib.fib618,
      summary: buildTechSummary({ price, sma200, rsi14: rsi }),
    },
    generatedAt: new Date().toISOString(),
    sourceNote:
      'Yahoo Finance EOD + TRY=X; TÜFE endeksi kamuya açık yaklaşık tablo (EVDS anahtarı opsiyonel). Temettü yılları trailing yield’den türetilmiş proxy.',
  };
}
