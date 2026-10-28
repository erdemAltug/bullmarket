'use client';

import { useMemo } from 'react';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { scoreOpportunity } from '@/lib/ai-opportunity';
import { cn } from '@/lib/utils';

/**
 * Score next to the price in the first screen of a symbol page.
 * Same score as the radar cards, so the number matches everywhere.
 */
export function HeaderScoreBadge({ symbol }: { symbol: string }) {
  const { data } = useMarketScanner();

  const score = useMemo(() => {
    const want = symbol.toUpperCase();
    const hit = data?.find(
      (i) =>
        i.displaySymbol.toUpperCase() === want ||
        i.symbol.toUpperCase().replace(/\.IS$/, '') === want
    );
    return hit ? scoreOpportunity(hit) : null;
  }, [data, symbol]);

  if (score == null) return null;

  const tone =
    score >= 75
      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
      : score >= 50
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
        : 'border-rose-500/40 bg-rose-500/10 text-rose-300';
  const label = score >= 75 ? 'Güçlü' : score >= 50 ? 'Nötr' : 'Zayıf';

  return (
    <a
      href="#skor"
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 tabular-nums',
        tone
      )}
      aria-label={`Bullsye skoru ${score} / 100, ${label}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
        Skor
      </span>
      <span className="font-mono text-lg font-semibold leading-none">
        {score}
        <span className="text-xs opacity-70">/100</span>
      </span>
      <span className="text-xs font-medium">{label}</span>
    </a>
  );
}
