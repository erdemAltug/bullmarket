'use client';

import { Building2, Sparkles, Target } from 'lucide-react';
import type { AssetAnalystConsensus } from '@/lib/analystData';
import { cn } from '@/lib/utils';

function money(n: number, currency: 'TL' | '$') {
  const prefix = currency === '$' ? '$' : '₺';
  return `${prefix}${n.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function ratingTone(rating: string) {
  if (rating.includes('AL') && !rating.includes('SAT')) {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
  }
  if (rating === 'TUT') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
  }
  return 'border-rose-500/30 bg-rose-500/10 text-rose-400';
}

export function AnalystTargetCard({ data }: { data: AssetAnalystConsensus }) {
  const totalVotes =
    data.ratings.strongBuy +
    data.ratings.buy +
    data.ratings.hold +
    data.ratings.sell;
  const buyPercent =
    totalVotes > 0
      ? Math.round(
          ((data.ratings.strongBuy + data.ratings.buy) / totalVotes) * 100
        )
      : 0;

  const rangeSpan = data.targetPriceHigh - data.targetPriceLow || 1;
  const meanPct = Math.min(
    100,
    Math.max(
      0,
      ((data.targetPriceMean - data.targetPriceLow) / rangeSpan) * 100
    )
  );
  const pricePct = Math.min(
    100,
    Math.max(
      0,
      ((data.currentPrice - data.targetPriceLow) / rangeSpan) * 100
    )
  );

  const segments = [
    { label: 'Güçlü Al', n: data.ratings.strongBuy, color: 'bg-emerald-500' },
    { label: 'Al', n: data.ratings.buy, color: 'bg-emerald-400/80' },
    { label: 'Tut', n: data.ratings.hold, color: 'bg-zinc-500' },
    { label: 'Sat', n: data.ratings.sell, color: 'bg-rose-500' },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400">
                <Target className="size-4" />
                12 Aylık Analist Konsensüs Hedefi
              </span>
              <span
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-[10px] font-bold',
                  data.upsidePotential >= 0
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                )}
              >
                {data.upsidePotential >= 0 ? '+' : ''}
                %{data.upsidePotential.toFixed(1)} Potansiyel Prim
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-3xl font-extrabold tracking-tight">
                {money(data.targetPriceMean, data.currency)}
              </span>
              <span className="text-xs text-[var(--muted)]">
                Mevcut: {money(data.currentPrice, data.currency)}
              </span>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-emerald-700/50 via-emerald-400/60 to-emerald-300/40" />
                <div
                  className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-zinc-950 bg-white shadow"
                  style={{ left: `${meanPct}%` }}
                  title="Ortalama hedef"
                />
                <div
                  className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300 bg-emerald-500"
                  style={{ left: `${pricePct}%` }}
                  title="Mevcut fiyat"
                />
              </div>
              <div className="flex justify-between font-mono text-[10px] text-zinc-500">
                <span>En Düşük: {money(data.targetPriceLow, data.currency)}</span>
                <span className="font-bold text-emerald-400">
                  Ortalama: {money(data.targetPriceMean, data.currency)}
                </span>
                <span>En Yüksek: {money(data.targetPriceHigh, data.currency)}</span>
              </div>
            </div>
          </div>

          <div className="flex min-w-[200px] flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-5 text-center">
            <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
              Analist Konsensüsü
            </div>
            <div
              className={cn(
                'mt-1 text-xl font-extrabold',
                data.consensusRating === 'SAT'
                  ? 'text-rose-400'
                  : data.consensusRating === 'TUT'
                    ? 'text-amber-300'
                    : 'text-emerald-400'
              )}
            >
              {data.consensusRating}
            </div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">
              %{buyPercent} analist AL öneriyor ({totalVotes} kurum)
            </div>
          </div>
        </div>

        {/* Buy / Hold / Sell distribution */}
        <div className="mt-5 space-y-2">
          <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
            Tavsiye Dağılımı
          </p>
          <div className="flex h-3 overflow-hidden rounded-full bg-zinc-800">
            {segments.map((s) =>
              s.n > 0 ? (
                <div
                  key={s.label}
                  className={cn('h-full', s.color)}
                  style={{ width: `${(s.n / totalVotes) * 100}%` }}
                  title={`${s.label}: ${s.n}`}
                />
              ) : null
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-[var(--muted)]">
            {segments.map((s) => (
              <span key={s.label}>
                <span
                  className={cn('mr-1 inline-block size-2 rounded-full', s.color)}
                />
                {s.label} {s.n}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 text-xs text-[var(--muted)]">
          <div className="mb-1.5 flex items-center gap-2 font-bold text-emerald-400">
            <Sparkles className="size-3.5" />
            Bullsye AI Yıllık Bakış Yorumu
          </div>
          <p className="leading-relaxed text-zinc-300">{data.aiSummaryNote}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-xl sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold">
          <Building2 className="size-4 text-zinc-400" />
          Aracı Kurum & Analist Raporları
        </h3>
        <div className="space-y-3">
          {data.recentBrokerReports.map((report) => (
            <div
              key={report.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 transition-colors hover:border-zinc-700 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold">{report.brokerName}</span>
                  <span className="text-[10px] text-[var(--muted)]">
                    {report.date}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs text-[var(--muted)]">
                  {report.comment}
                </p>
              </div>

              <div className="shrink-0 sm:text-right">
                <span
                  className={cn(
                    'inline-block rounded-md border px-2.5 py-0.5 text-[10px] font-bold',
                    ratingTone(report.rating)
                  )}
                >
                  {report.rating}
                </span>
                <div className="mt-1 font-mono text-xs font-bold">
                  Hedef: {money(report.targetPrice, data.currency)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
