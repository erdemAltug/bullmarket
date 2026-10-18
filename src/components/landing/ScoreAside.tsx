'use client';

import { useMemo } from 'react';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { scoreOpportunity } from '@/lib/ai-opportunity';
import { cn, formatPercent } from '@/lib/utils';

const WANT = ['THYAO', 'NVDA', 'BTC'] as const;

const BANDS = [
  {
    range: '80–100',
    label: 'Güçlü',
    note: 'Momentum ve gün içi bant aynı yönde',
    tone: 'text-[var(--up)]',
  },
  {
    range: '50–79',
    label: 'Nötr',
    note: 'Tek başına işlem gerekçesi değil',
    tone: 'text-[var(--foreground)]',
  },
  {
    range: '0–49',
    label: 'Zayıf',
    note: 'Baskı veya iskonto',
    tone: 'text-[var(--down)]',
  },
] as const;

export function ScoreAside() {
  const { data } = useMarketScanner();

  const picks = useMemo(() => {
    const list = data ?? [];
    return WANT.map((token) => {
      const item = list.find(
        (row) => row.displaySymbol.toUpperCase() === token
      );
      if (!item) return { token, score: null, change: null };
      return {
        token,
        score: scoreOpportunity(item),
        change: item.changePercent,
      };
    });
  }, [data]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Skor</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        F/K, hacim, momentum ve gün içi bant. 0–100. Kayıt gerekmez.
      </p>

      <ul className="mt-5 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]/70">
        {picks.map((pick) => (
          <li
            key={pick.token}
            className="flex items-center justify-between gap-3 px-3 py-3"
          >
            <div>
              <p className="text-sm font-semibold">{pick.token}</p>
              <p
                className={cn(
                  'text-xs font-medium',
                  pick.change == null
                    ? 'text-[var(--muted)]'
                    : pick.change >= 0
                      ? 'text-[var(--up)]'
                      : 'text-[var(--down)]'
                )}
              >
                {pick.change == null ? '—' : formatPercent(pick.change)}
              </p>
            </div>
            <p className="font-mono text-2xl font-semibold tabular-nums text-[var(--up)]">
              {pick.score ?? '—'}
              <span className="text-xs text-[var(--muted)]">/100</span>
            </p>
          </li>
        ))}
      </ul>

      <ul className="mt-5 space-y-3">
        {BANDS.map((band) => (
          <li key={band.range} className="flex items-baseline gap-3">
            <span
              className={cn(
                'w-16 shrink-0 font-mono text-sm font-semibold',
                band.tone
              )}
            >
              {band.range}
            </span>
            <span className="text-sm font-medium">{band.label}</span>
            <span className="text-xs text-[var(--muted)]">{band.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
