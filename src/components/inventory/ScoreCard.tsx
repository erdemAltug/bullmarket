import { cn } from '@/lib/utils';

export type ScoreReason = {
  id: string;
  label: string;
};

type ScoreCardProps = {
  score: number;
  reasons: ScoreReason[];
  symbol: string;
  className?: string;
};

/** Analiz karnesi — skor + max 3 somut neden (tavsiye değil). */
export function ScoreCard({ score, reasons, symbol, className }: ScoreCardProps) {
  const tone =
    score >= 70 ? 'text-emerald-400' : score >= 45 ? 'text-amber-300' : 'text-zinc-300';

  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5',
        className
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Analiz skoru
        </h3>
        <p className={cn('text-3xl font-bold tabular-nums', tone)}>
          {Math.round(score)}
          <span className="text-base font-medium text-[var(--muted)]">/100</span>
        </p>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">{symbol}</p>
      <ul className="mt-4 space-y-2">
        {reasons.slice(0, 3).map((r) => (
          <li
            key={r.id}
            className="flex gap-2 text-sm leading-snug text-[var(--foreground)]"
          >
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
