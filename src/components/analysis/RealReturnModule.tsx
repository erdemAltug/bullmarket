'use client';

import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AnalysisModuleFooter } from '@/components/analysis/AnalysisModuleFooter';
import type { RealReturnMode, SymbolAnalysisBundle } from '@/lib/analysis/types';
import { cn } from '@/lib/utils';

const MODES: { id: RealReturnMode; label: string }[] = [
  { id: 'try', label: 'TL Bazlı' },
  { id: 'usd', label: 'USD / Dolar' },
  { id: 'tufe', label: 'TÜFE / Reel' },
];

type Props = {
  data: SymbolAnalysisBundle;
};

export function RealReturnModule({ data }: Props) {
  const [mode, setMode] = useState<RealReturnMode>('try');
  const chart = useMemo(
    () =>
      data.realReturn.points.map((p) => ({
        t: p.t,
        label: new Date(p.t).toLocaleDateString('tr-TR', {
          month: 'short',
          year: '2-digit',
        }),
        v: p[mode],
      })),
    [data.realReturn.points, mode]
  );
  const s = data.realReturn.summary;

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">
        Enflasyon ve dolar bazlı reel getiri
      </h3>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Başlangıç = 100. TÜFE tablosu kamuya açık yaklaşık endeks.
      </p>

      <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              mode === m.id
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} minTickGap={28} />
            <YAxis tick={{ fontSize: 10 }} width={36} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => [Number(v).toFixed(1), 'Endeks']}
            />
            <Line
              type="monotone"
              dataKey="v"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 rounded-xl bg-[var(--surface)] p-3 text-xs leading-relaxed text-[var(--foreground)]">
        {s.label}
        <div className="mt-2 flex flex-wrap gap-3 text-[var(--muted)]">
          <span>Hisse: ₺{s.stockEnd.toLocaleString('tr-TR')}</span>
          <span>Mevduat ~: ₺{s.depositEnd.toLocaleString('tr-TR')}</span>
          <span>
            TÜFE farkı:{' '}
            <span
              className={
                s.realLossPctVsTufe >= 0 ? 'text-emerald-500' : 'text-rose-500'
              }
            >
              {s.realLossPctVsTufe >= 0 ? '+' : ''}
              {s.realLossPctVsTufe}%
            </span>
          </span>
        </div>
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
