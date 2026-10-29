import Link from 'next/link';
import { ArrowRight, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

type NetWorthStripProps = {
  value: number;
  pnl: number;
  pnlPct: number;
  daily: number;
  dailyPct: number;
  count: number;
  /** Show the "Envanterim" link (terminal); hidden on /portfolio itself. */
  href?: string;
  className?: string;
};

function tl(n: number): string {
  return `₺${Math.round(n).toLocaleString('tr-TR')}`;
}

function signed(n: number, suffix = ''): string {
  return `${n >= 0 ? '+' : '−'}${Math.abs(n).toLocaleString('tr-TR', {
    maximumFractionDigits: suffix ? 2 : 0,
  })}${suffix}`;
}

/** One-line net worth: total · today · since cost. */
export function NetWorthStrip({
  value,
  pnl,
  pnlPct,
  daily,
  dailyPct,
  count,
  href,
  className,
}: NetWorthStripProps) {
  const cells = [
    { label: 'Bugün', abs: daily, pct: dailyPct },
    { label: 'Toplam K/Z', abs: pnl, pct: pnlPct },
  ];

  return (
    <section
      aria-label="Net varlık özeti"
      className={cn(
        'flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
          <Wallet className="size-4" />
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
            Envanter · {count} kalem
          </p>
          <p className="text-xl font-semibold tabular-nums">{tl(value)}</p>
        </div>
      </div>

      {cells.map((c) => (
        <div key={c.label}>
          <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
            {c.label}
          </p>
          <p
            className={cn(
              'text-sm font-semibold tabular-nums',
              c.abs >= 0 ? 'text-emerald-400' : 'text-rose-400'
            )}
          >
            {signed(Math.round(c.abs))} ₺{' '}
            <span className="text-xs font-medium opacity-80">
              ({signed(c.pct, '%')})
            </span>
          </p>
        </div>
      ))}

      {href ? (
        <Link
          href={href}
          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300"
        >
          Envanterim <ArrowRight className="size-3.5" />
        </Link>
      ) : null}
    </section>
  );
}
