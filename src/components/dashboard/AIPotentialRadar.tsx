'use client';

import Link from 'next/link';
import type { PotentialCard } from '@/lib/ai-opportunity';
import { cn } from '@/lib/utils';

interface AIPotentialRadarProps {
  cards: PotentialCard[];
  loading?: boolean;
}

function money(n: number, currency: 'TRY' | 'USD') {
  const prefix = currency === 'USD' ? '$' : '₺';
  return `${prefix}${n.toLocaleString('tr-TR', {
    maximumFractionDigits: n >= 100 ? 2 : 4,
  })}`;
}

export function AIPotentialRadar({ cards, loading }: AIPotentialRadarProps) {
  if (loading && !cards.length) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]"
          />
        ))}
      </div>
    );
  }

  if (!cards.length) {
    return (
      <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
        Canlı fırsat kartı henüz oluşmadı — piyasa verisi bekleniyor.
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Canlı Fırsat Radarı
        </h2>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          F/K, hacim ve gün içi banttan skor — uydurma fiyat hedefi yok
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.symbol}
            className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-emerald-500/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {card.href ? (
                  <Link
                    href={card.href}
                    className="text-base font-bold hover:text-emerald-400 hover:underline"
                  >
                    {card.displaySymbol}
                  </Link>
                ) : (
                  <h3 className="text-base font-bold">{card.displaySymbol}</h3>
                )}
                <p className="truncate text-[11px] text-[var(--muted)]">
                  {card.name}
                </p>
                <p className="mt-1 font-mono text-sm tabular-nums text-[var(--muted)]">
                  {money(card.price, card.currency)}{' '}
                  <span
                    className={
                      card.changePercent >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }
                  >
                    {card.changePercent >= 0 ? '+' : ''}
                    {card.changePercent.toFixed(2)}%
                  </span>
                </p>
              </div>
              <div
                className={cn(
                  'shrink-0 rounded-xl border px-2.5 py-1.5 text-center',
                  card.score >= 80
                    ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                    : card.score >= 65
                      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                      : 'border-amber-500/25 bg-amber-500/10 text-amber-300'
                )}
              >
                <p className="text-[9px] uppercase tracking-wide opacity-80">
                  Skor
                </p>
                <p className="font-mono text-lg font-black leading-none">
                  {card.score}
                  <span className="text-xs font-normal">/100</span>
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/50 p-2">
                <p className="text-[var(--muted)]">Gün içi zirve</p>
                <p className="mt-0.5 font-mono font-semibold">
                  {card.dayHigh != null
                    ? money(card.dayHigh, card.currency)
                    : '—'}
                </p>
                {card.toHighPct != null ? (
                  <p className="text-[10px] text-emerald-400">
                    mesafe %{card.toHighPct.toFixed(1)}
                  </p>
                ) : null}
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/50 p-2">
                <p className="text-[var(--muted)]">Gün içi dip</p>
                <p className="mt-0.5 font-mono font-semibold">
                  {card.dayLow != null
                    ? money(card.dayLow, card.currency)
                    : '—'}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-[var(--border)] pt-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Neden bu varlık?
              </p>
              <ul className="space-y-1 text-[11px] leading-snug text-zinc-400">
                {card.catalysts.map((c) => (
                  <li key={c} className="flex gap-1.5">
                    <span className="mt-0.5 text-emerald-500">+</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
