'use client';

import { AnalysisModuleFooter } from '@/components/analysis/AnalysisModuleFooter';
import type { SymbolAnalysisBundle } from '@/lib/analysis/types';

type Props = { data: SymbolAnalysisBundle };

function row(label: string, v: number | null) {
  return (
    <li className="flex items-center justify-between rounded-lg bg-[var(--surface)] px-3 py-2 text-xs">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium tabular-nums text-[var(--foreground)]">
        {v == null
          ? '—'
          : `₺${v.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`}
      </span>
    </li>
  );
}

export function TechLevelsModule({ data }: Props) {
  const l = data.levels;
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
      <h3 className="text-sm font-semibold">Akıllı teknik seviyeler</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">
        SMA 20/50/200 + Fibonacci (120 gün penceresi) · kural tabanlı
      </p>

      <p className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm leading-relaxed text-[var(--foreground)]">
        {l.summary}
      </p>

      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {row('Fiyat', l.price)}
        {row('SMA 20', l.sma20)}
        {row('SMA 50', l.sma50)}
        {row('SMA 200', l.sma200)}
        {row('Fib 38,2%', l.fib382)}
        {row('Fib 50%', l.fib500)}
        {row('Fib 61,8%', l.fib618)}
        <li className="flex items-center justify-between rounded-lg bg-[var(--surface)] px-3 py-2 text-xs">
          <span className="text-[var(--muted)]">RSI 14</span>
          <span className="font-medium tabular-nums">
            {l.rsi14 == null ? '—' : l.rsi14.toFixed(0)}
          </span>
        </li>
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
