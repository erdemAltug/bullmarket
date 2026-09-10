'use client';

import { AnalysisModuleFooter } from '@/components/analysis/AnalysisModuleFooter';
import type { SymbolAnalysisBundle } from '@/lib/analysis/types';

type Props = { data: SymbolAnalysisBundle };

function fmt(n: number | null) {
  if (n == null) return '—';
  return `₺${n.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`;
}

export function TargetGaugeModule({ data }: Props) {
  const { price, low, mean, high, upsidePct } = data.target;
  const lo = low ?? Math.min(price * 0.85, mean ?? price);
  const hi = high ?? Math.max(price * 1.25, mean ?? price);
  const span = Math.max(hi - lo, 1);
  const pct = (v: number) => Math.min(100, Math.max(0, ((v - lo) / span) * 100));

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
      <h3 className="text-sm font-semibold">Hedef fiyat</h3>

      <div className="relative mt-6 h-3 rounded-full bg-[var(--surface)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]/30"
          style={{ width: '100%' }}
        />
        {mean != null ? (
          <span
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--card)]"
            style={{ left: `${pct(mean)}%` }}
            title="Konsensüs"
          />
        ) : null}
        <span
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--foreground)] ring-2 ring-[var(--card)]"
          style={{ left: `${pct(price)}%` }}
          title="Güncel"
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded-lg bg-[var(--surface)] p-2">
          <dt className="text-[var(--muted)]">En düşük</dt>
          <dd className="font-medium">{fmt(low)}</dd>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-2">
          <dt className="text-[var(--muted)]">Konsensüs</dt>
          <dd className="font-medium">{fmt(mean)}</dd>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-2">
          <dt className="text-[var(--muted)]">En yüksek</dt>
          <dd className="font-medium">{fmt(high)}</dd>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-2">
          <dt className="text-[var(--muted)]">Güncel</dt>
          <dd className="font-medium">{fmt(price)}</dd>
        </div>
      </dl>

      {upsidePct != null ? (
        <p className="mt-3 text-sm font-medium">
          Potansiyel yükseliş marjı:{' '}
          <span
            className={upsidePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}
          >
            {upsidePct >= 0 ? '+' : ''}
            {upsidePct.toFixed(1)}%
          </span>
        </p>
      ) : (
        <p className="mt-3 text-xs text-[var(--muted)]">Hedef fiyat yok.</p>
      )}

      <AnalysisModuleFooter
        symbol={data.symbol}
        displaySymbol={data.displaySymbol}
        name={data.name}
        price={data.price}
      />
    </article>
  );
}
