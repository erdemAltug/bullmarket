'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AssetDetailDrawer } from '@/components/dashboard/AssetDetailDrawer';
import { HintTooltip } from '@/components/shared/HintTooltip';
import { useScoreHistory } from '@/hooks/useScoreHistory';
import type { PotentialCard } from '@/lib/ai-opportunity';
import { cn } from '@/lib/utils';

interface AIPotentialRadarProps {
  cards: PotentialCard[];
  loading?: boolean;
  /** Hide built-in title when parent provides aligned section header */
  hideHeader?: boolean;
}

const SCORE_TIP =
  'Fırsat skoru 0–100: momentum, gün içi bant ve F/K. Formül: Eğitim → AI fırsat skoru nasıl okunur.';
const PE_TIP =
  'Fiyat/Kazanç Oranı: Sektör ortalamasının altında, hissenin kârlılığına göre uygun fiyatlandığını gösterir.';
const DIST_TIP =
  'Hissenin gün içi zirvesine veya dibine olan anlık uzaklık yüzdesi.';

function money(n: number, currency: 'TRY' | 'USD') {
  const prefix = currency === 'USD' ? '$' : '₺';
  return `${prefix}${n.toLocaleString('tr-TR', {
    maximumFractionDigits: n >= 100 ? 2 : 4,
  })}`;
}

export function AIPotentialRadar({
  cards,
  loading,
  hideHeader = false,
}: AIPotentialRadarProps) {
  const [selected, setSelected] = useState<PotentialCard | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hist = useScoreHistory(
    cards.map((c) => ({ symbol: c.symbol, score: c.score }))
  );

  function openCard(card: PotentialCard) {
    setSelected(card);
    setDrawerOpen(true);
  }

  if (loading && !cards.length) {
    return (
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)] sm:h-56"
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
    <section className={hideHeader ? undefined : 'space-y-4'}>
      {!hideHeader ? (
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Canlı Fırsat Radarı
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Canlı skor sıralaması · gün içi bant ve değerleme
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.symbol}
            role="button"
            tabIndex={0}
            onClick={() => openCard(card)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openCard(card);
              }
            }}
            className={cn(
              'flex cursor-pointer flex-col rounded-2xl border bg-[var(--card)]/90 p-4 backdrop-blur-xl',
              'transition-all duration-200 hover:scale-[1.01] hover:border-emerald-500/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
              card.score >= 80
                ? 'border-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.12)]'
                : 'border-[var(--border)]'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  {card.displaySymbol}
                </h3>
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
              <HintTooltip content={SCORE_TIP} title="Fırsat skoru" withIcon={false}>
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
              </HintTooltip>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-3">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/50 p-2">
                <HintTooltip
                  content={DIST_TIP}
                  title="Zirve mesafesi"
                  withIcon={false}
                  className="text-[var(--muted)]"
                >
                  Zirve mesafe
                </HintTooltip>
                <p className="mt-0.5 font-mono font-semibold">
                  {card.toHighPct != null
                    ? `%${card.toHighPct.toFixed(1)}`
                    : '—'}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {card.dayHigh != null
                    ? money(card.dayHigh, card.currency)
                    : '—'}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/50 p-2">
                <HintTooltip
                  content={DIST_TIP}
                  title="Dip mesafesi"
                  withIcon={false}
                  className="text-[var(--muted)]"
                >
                  Dip mesafe
                </HintTooltip>
                <p className="mt-0.5 font-mono font-semibold">
                  {card.toLowPct != null
                    ? `%${card.toLowPct.toFixed(1)}`
                    : '—'}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {card.dayLow != null
                    ? money(card.dayLow, card.currency)
                    : '—'}
                </p>
              </div>
              <div className="col-span-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]/50 p-2 sm:col-span-1">
                <HintTooltip
                  content={PE_TIP}
                  title="F/K oranı"
                  withIcon={false}
                  className="text-[var(--muted)]"
                >
                  F/K
                </HintTooltip>
                <p className="mt-0.5 font-mono font-semibold">
                  {card.trailingPE != null && card.trailingPE > 0
                    ? card.trailingPE.toFixed(1)
                    : '—'}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {card.volume ? `hacim ${card.volume}` : 'canlı'}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-[var(--border)] pt-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Neden bu varlık?
              </p>
              <ul className="space-y-1 text-[11px] leading-snug text-zinc-400">
                {card.catalysts.slice(0, 3).map((c) => (
                  <li key={c} className="flex gap-1.5">
                    <span className="mt-0.5 text-emerald-500">+</span>
                    <span className="line-clamp-2">{c}</span>
                  </li>
                ))}
              </ul>
              {(hist[card.symbol]?.length ?? 0) > 1 ? (
                <p className="mt-2 font-mono text-[10px] tabular-nums text-[var(--muted)]">
                  7g skor: {hist[card.symbol].join(' → ')}
                </p>
              ) : null}
              <Link
                href="/egitim/teknik-analiz/ai-firsat-skoru-nasil-okunur"
                className="mt-2 inline-block text-[10px] text-emerald-400 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Skor nasıl hesaplanır?
              </Link>
            </div>
          </article>
        ))}
      </div>

      <AssetDetailDrawer
        card={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </section>
  );
}
