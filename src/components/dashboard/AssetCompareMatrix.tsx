'use client';

import { useMemo } from 'react';
import { cn, formatPercent } from '@/lib/utils';
import { buildCompareVerdict } from '@/lib/compare-verdict';
import type { CompareMetrics } from '@/types';

type MetricKey = keyof Pick<
  CompareMetrics,
  | 'trailingPE'
  | 'priceToBook'
  | 'yearReturn'
  | 'earningsGrowth'
  | 'beta'
  | 'dividendYield'
>;

const ROWS: { key: MetricKey; label: string; better: 'lower' | 'higher' }[] = [
  { key: 'trailingPE', label: 'F/K (P/E)', better: 'lower' },
  { key: 'priceToBook', label: 'PD/DD (P/B)', better: 'lower' },
  { key: 'yearReturn', label: '1Y Getiri', better: 'higher' },
  { key: 'earningsGrowth', label: 'Kâr Büyümesi', better: 'higher' },
  { key: 'beta', label: 'Beta / Volatilite', better: 'lower' },
  { key: 'dividendYield', label: 'Temettü Verimi', better: 'higher' },
];

function fmt(key: MetricKey, v: number | null): string {
  if (v == null) return '—';
  if (key === 'yearReturn') return formatPercent(v);
  if (key === 'earningsGrowth' || key === 'dividendYield')
    return `%${(v * 100).toFixed(1)}`;
  return v.toFixed(2);
}

function bestIndex(
  items: CompareMetrics[],
  key: MetricKey,
  better: 'lower' | 'higher'
): number {
  let best = -1;
  let bestVal: number | null = null;
  items.forEach((it, i) => {
    const v = it[key];
    if (v == null) return;
    if (
      bestVal == null ||
      (better === 'lower' ? v < bestVal : v > bestVal)
    ) {
      bestVal = v;
      best = i;
    }
  });
  return best;
}

function short(sym: string) {
  return sym.replace('.IS', '').replace('USDT', '');
}

interface AssetCompareMatrixProps {
  items: CompareMetrics[];
  showVerdict?: boolean;
}

export function AssetCompareMatrix({
  items,
  showVerdict = true,
}: AssetCompareMatrixProps) {
  const winners = useMemo(() => {
    const map: Partial<Record<MetricKey, number>> = {};
    for (const row of ROWS) {
      map[row.key] = bestIndex(items, row.key, row.better);
    }
    return map;
  }, [items]);

  const verdict =
    showVerdict && items.length >= 2
      ? buildCompareVerdict(items[0], items[1])
      : null;

  if (!items.length) return null;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-[var(--surface)] text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2.5 text-left font-medium">Metrik</th>
              {items.map((it) => (
                <th key={it.symbol} className="px-3 py-2.5 text-right font-semibold text-[var(--foreground)]">
                  {short(it.symbol)}
                  <span className="mt-0.5 block text-[10px] font-normal text-[var(--muted)]">
                    {it.price > 0
                      ? it.price.toLocaleString('tr-TR', {
                          maximumFractionDigits: 2,
                        })
                      : '—'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key} className="border-t border-[var(--border)]">
                <td className="px-3 py-2.5 text-[var(--muted)]">{row.label}</td>
                {items.map((it, i) => (
                  <td
                    key={it.symbol}
                    className={cn(
                      'px-3 py-2.5 text-right tabular-nums',
                      winners[row.key] === i &&
                        'bg-emerald-500/15 font-semibold text-emerald-300'
                    )}
                  >
                    {fmt(row.key, it[row.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {verdict ? (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm leading-relaxed text-emerald-100/90">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            AI Özet Karar
          </p>
          {verdict}
        </div>
      ) : null}

      <p className="text-[11px] text-[var(--muted)]">
        Yeşil hücre: metrikte göreli avantaj (düşük çarpan / yüksek getiri).
      </p>
    </div>
  );
}
