'use client';

import { cn, formatPercent } from '@/lib/utils';

type VsDepositCounterProps = {
  /** Portföy hisse/kripto aylık yaklaşık getiri % */
  equityMonthPct: number;
  /** Mevduat aylık yaklaşık getiri % (yıllık/12) */
  depositMonthPct: number | null;
  className?: string;
};

/** Hisse K/Z vs mevduat — tavsiye değil, senin sayıların. */
export function VsDepositCounter({
  equityMonthPct,
  depositMonthPct,
  className,
}: VsDepositCounterProps) {
  if (depositMonthPct == null) {
    return (
      <div
        className={cn(
          'rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted)]',
          className
        )}
      >
        Mevduat satırı ekle — hisse getirini risksiz faizle yan yana gör.
      </div>
    );
  }

  const delta = equityMonthPct - depositMonthPct;
  const ahead = delta >= 0;

  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3',
        ahead
          ? 'border-emerald-500/25 bg-emerald-500/5'
          : 'border-amber-500/25 bg-amber-500/5',
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        Hisse vs mevduat (aylık kabaca)
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--foreground)]">
        {ahead ? (
          <>
            Hisselerin bu ay mevduat getirisini{' '}
            <span className="font-semibold text-emerald-400">
              {formatPercent(delta)}
            </span>{' '}
            aştı.
          </>
        ) : (
          <>
            Mevduat bu ay hisse performansını{' '}
            <span className="font-semibold text-amber-300">
              {formatPercent(Math.abs(delta))}
            </span>{' '}
            önde.
          </>
        )}
      </p>
      <p className="mt-1 text-[11px] text-[var(--muted)]">
        Hisse ~{formatPercent(equityMonthPct)} · mevduat ~%
        {depositMonthPct.toFixed(2)} (yıllık/12). Yatırım tavsiyesi değildir.
      </p>
    </div>
  );
}
