'use client';

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { AnalysisModuleFooter } from '@/components/analysis/AnalysisModuleFooter';
import type { SymbolAnalysisBundle } from '@/lib/analysis/types';

type Props = { data: SymbolAnalysisBundle };

export function HealthRadarModule({ data }: Props) {
  const chart = data.healthRadar.map((a) => ({
    axis: a.label,
    score: a.score,
  }));

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
      <h3 className="text-sm font-semibold">Sağlık radarı</h3>
      <div className="mt-2 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chart} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Radar
              name="Skor"
              dataKey="score"
              stroke="var(--accent)"
              fill="var(--accent)"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-1 grid grid-cols-2 gap-1.5 text-[11px] text-[var(--muted)] sm:grid-cols-5">
        {data.healthRadar.map((a) => (
          <li key={a.key} className="rounded-lg bg-[var(--surface)] px-2 py-1.5">
            <span className="block text-[var(--foreground)]">{a.score}</span>
            {a.label}
          </li>
        ))}
      </ul>
      <AnalysisModuleFooter
        symbol={data.symbol}
        displaySymbol={data.displaySymbol}
        name={data.name}
        price={data.price}
      />
    </article>
  );
}
