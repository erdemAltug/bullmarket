'use client';

import { useMemo, useState } from 'react';
import { GitCompare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCompare } from '@/hooks/useIntelligence';
import { SEARCH_CATALOG } from '@/lib/search-catalog';
import { cn, formatPercent } from '@/lib/utils';
import type { CompareMetrics } from '@/types';

const PICKS = SEARCH_CATALOG.filter(
  (i) => i.kind === 'bist' || i.kind === 'crypto'
).map((i) => {
  const m = i.href.match(/symbol=([^&]+)/);
  return {
    symbol: m ? decodeURIComponent(m[1]) : i.id,
    label: i.label.split('·')[0].trim(),
  };
});

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
  { key: 'trailingPE', label: 'F/K', better: 'lower' },
  { key: 'priceToBook', label: 'PD/DD', better: 'lower' },
  { key: 'yearReturn', label: 'Yıllık Getiri %1Y', better: 'higher' },
  { key: 'earningsGrowth', label: 'Kar Büyümesi', better: 'higher' },
  { key: 'beta', label: 'Beta (Volatilite)', better: 'lower' },
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

interface ComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComparisonModal({ open, onOpenChange }: ComparisonModalProps) {
  const [selected, setSelected] = useState<string[]>([
    'THYAO.IS',
    'GARAN.IS',
  ]);

  const symbolsKey = selected.join(',');
  const { data, isFetching, error } = useCompare(
    open && selected.length >= 2 ? selected : []
  );
  const items = data?.items ?? [];

  function toggle(sym: string) {
    setSelected((prev) => {
      if (prev.includes(sym)) return prev.filter((s) => s !== sym);
      if (prev.length >= 3) return [...prev.slice(1), sym];
      return [...prev, sym];
    });
  }

  const winners = useMemo(() => {
    const map: Partial<Record<MetricKey, number>> = {};
    for (const row of ROWS) {
      map[row.key] = bestIndex(items, row.key, row.better);
    }
    return map;
  }, [items]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-4">
        <DialogTitle className="mb-3 flex items-center gap-2 px-1">
          <GitCompare className="size-4 text-emerald-400" />
          Varlık Kıyaslama
        </DialogTitle>

        <div className="mb-3 flex flex-wrap gap-2 px-1">
          {PICKS.map((p) => (
            <button
              key={p.symbol}
              type="button"
              onClick={() => toggle(p.symbol)}
              className={cn(
                'rounded-md border px-2 py-1 text-xs',
                selected.includes(p.symbol)
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                  : 'border-zinc-700 text-zinc-400 hover:bg-zinc-900'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {selected.length < 2 ? (
          <p className="px-1 text-sm text-zinc-500">En az 2 varlık seçin.</p>
        ) : isFetching && !items.length ? (
          <p className="px-1 text-sm text-zinc-500">Kıyaslanıyor…</p>
        ) : error ? (
          <p className="px-1 text-sm text-red-400">{error.message}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-zinc-900/80 text-zinc-400">
                <tr>
                  <th className="px-3 py-2 text-left">Metrik</th>
                  {items.map((it) => (
                    <th key={it.symbol} className="px-3 py-2 text-right">
                      {it.symbol.replace('.IS', '').replace('USDT', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    key={row.key}
                    className="border-t border-zinc-800/80"
                  >
                    <td className="px-3 py-2 text-zinc-400">{row.label}</td>
                    {items.map((it, i) => (
                      <td
                        key={it.symbol}
                        className={cn(
                          'px-3 py-2 text-right tabular-nums',
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
        )}

        <p className="mt-2 px-1 text-[11px] text-zinc-600">
          Yeşil hücre: metrikte göreli olarak daha avantajlı (ucuz / yüksek getiri).
          · {symbolsKey}
        </p>
      </DialogContent>
    </Dialog>
  );
}

export function ComparisonTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className="gap-1.5">
      <GitCompare className="size-3.5" />
      Kıyasla
    </Button>
  );
}
