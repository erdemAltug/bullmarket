'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AnalysisModuleFooter } from '@/components/analysis/AnalysisModuleFooter';
import type { SymbolAnalysisBundle } from '@/lib/analysis/types';
import { cn } from '@/lib/utils';

type Metric = 'pe' | 'pb' | 'yearReturn' | 'dividendYield';

const METRICS: { id: Metric; label: string }[] = [
  { id: 'pe', label: 'F/K' },
  { id: 'pb', label: 'PD/DD' },
  { id: 'yearReturn', label: '1Y Getiri %' },
  { id: 'dividendYield', label: 'Temettü %' },
];

type Props = { data: SymbolAnalysisBundle };

export function PeerCompareModule({ data }: Props) {
  const [metric, setMetric] = useState<Metric>('pe');
  const chart = useMemo(
    () =>
      data.peers.map((p) => ({
        name: p.displaySymbol,
        value: p[metric] ?? 0,
        focus: p.isFocus,
        missing: p[metric] == null,
      })),
    [data.peers, metric]
  );

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
      <h3 className="text-sm font-semibold">Sektörel akran karşılaştırması</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">
        {data.sectorTr} · odak hisse vurgulu
      </p>
      <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
        {METRICS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMetric(m.id)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium',
              metric === m.id
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)]'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} width={36} />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v, _n, item) => {
                const miss = (item?.payload as { missing?: boolean })?.missing;
                return [miss ? '—' : Number(v).toFixed(2), METRICS.find((m) => m.id === metric)?.label];
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chart.map((row) => (
                <Cell
                  key={row.name}
                  fill={row.focus ? 'var(--accent)' : 'var(--muted)'}
                  fillOpacity={row.missing ? 0.25 : row.focus ? 1 : 0.55}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <AnalysisModuleFooter
        symbol={data.symbol}
        displaySymbol={data.displaySymbol}
        name={data.name}
        price={data.price}
      />
    </article>
  );
}
