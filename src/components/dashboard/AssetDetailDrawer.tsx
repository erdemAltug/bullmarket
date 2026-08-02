'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, GitCompare, Star } from 'lucide-react';
import { AlertModal } from '@/components/alerts/AlertModal';
import { HintTooltip } from '@/components/shared/HintTooltip';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useWatchlist } from '@/hooks/useWatchlist';
import {
  buildMicroReview,
  type PotentialCard,
} from '@/lib/ai-opportunity';
import { cn } from '@/lib/utils';

const SCORE_TIP =
  'Bullsye AI Skoru; canlı F/K, 24s hacim ivmesi ve gün içi bant pozisyonunun ağırlıklı ortalamasıyla hesaplanır.';
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

interface AssetDetailDrawerProps {
  card: PotentialCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetDetailDrawer({
  card,
  open,
  onOpenChange,
}: AssetDetailDrawerProps) {
  const { hasSymbol, addSymbol, removeSymbol } = useWatchlist({
    enabled: open,
  });
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    if (!open) setAlertOpen(false);
  }, [open]);

  if (!card) return null;

  const starred = hasSymbol(card.symbol);
  const review = buildMicroReview(card);
  const compareA =
    card.category === 'CRYPTO'
      ? card.symbol
      : card.category === 'BIST'
        ? `${card.displaySymbol}.IS`
        : card.category === 'FON'
          ? `TEFAS:${card.displaySymbol}`
          : card.displaySymbol;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full max-w-full border-zinc-800/80 bg-zinc-950/95 p-0 backdrop-blur-xl sm:max-w-md">
          <div className="flex h-full flex-col overflow-y-auto">
            <header className="border-b border-zinc-800/80 p-5 pr-12">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <SheetTitle className="text-xl font-bold tracking-tight text-zinc-50">
                    {card.displaySymbol}
                  </SheetTitle>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {card.name}
                  </p>
                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
                    <span className="font-mono text-2xl font-bold tabular-nums text-zinc-50">
                      {money(card.price, card.currency)}
                    </span>
                    <span
                      className={cn(
                        'rounded-md border px-2 py-0.5 text-xs font-bold',
                        card.changePercent >= 0
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                      )}
                    >
                      {card.changePercent >= 0 ? '+' : ''}
                      {card.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              <HintTooltip content={SCORE_TIP} title="Bullsye Skoru" withIcon={false}>
                  <div
                    className={cn(
                      'shrink-0 rounded-xl border px-3 py-2 text-center',
                      card.score >= 80
                        ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                        : card.score >= 65
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                    )}
                  >
                    <p className="text-[9px] uppercase tracking-wide opacity-80">
                      Skor
                    </p>
                    <p className="font-mono text-xl font-black leading-none">
                      {card.score}
                      <span className="text-xs font-normal">/100</span>
                    </p>
                  </div>
                </HintTooltip>
              </div>
            </header>

            <div className="space-y-5 p-5">
              <section className="rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 backdrop-blur-sm">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  AI Micro-Review
                </p>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {review}
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  {card.category === 'FON' || card.category === 'ETF'
                    ? 'Fon dökümü'
                    : 'Teknik döküm'}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {card.category === 'FON' || card.category === 'ETF' ? (
                    <>
                      <Metric
                        label="Fon tipi"
                        value={card.fundStyle || card.category}
                        tip="Fon / ETF stil etiketi — TEFAS veya küresel sınıflandırma."
                        tipTitle="Fon tipi"
                      />
                      <Metric
                        label="Günlük getiri"
                        value={`${card.changePercent >= 0 ? '+' : ''}${card.changePercent.toFixed(2)}%`}
                        tip="Son seans / gün değişimi."
                        tipTitle="Getiri"
                      />
                      <Metric
                        label={
                          card.category === 'FON' ? 'Portföy büyüklüğü' : 'Hacim'
                        }
                        value={card.volume || '—'}
                        tip={
                          card.category === 'FON'
                            ? 'TEFAS toplam portföy büyüklüğü (AUM).'
                            : 'Canlı işlem hacmi.'
                        }
                        tipTitle={
                          card.category === 'FON' ? 'AUM' : 'Hacim'
                        }
                      />
                      <Metric
                        label={
                          card.category === 'FON'
                            ? 'Yatırımcı sayısı'
                            : 'Gün içi zirve'
                        }
                        value={
                          card.category === 'FON'
                            ? card.investorCount != null
                              ? card.investorCount.toLocaleString('tr-TR')
                              : '—'
                            : card.dayHigh != null
                              ? money(card.dayHigh, card.currency)
                              : '—'
                        }
                        tip={
                          card.category === 'FON'
                            ? 'TEFAS bildirilen yatırımcı / katılımcı sayısı.'
                            : DIST_TIP
                        }
                        tipTitle={
                          card.category === 'FON' ? 'Katılımcı' : 'Mesafe'
                        }
                      />
                    </>
                  ) : (
                    <>
                      <Metric
                        label="Gün içi zirve"
                        value={
                          card.dayHigh != null
                            ? money(card.dayHigh, card.currency)
                            : '—'
                        }
                        tip={DIST_TIP}
                        tipTitle="Mesafe"
                        sub={
                          card.toHighPct != null
                            ? `mesafe %${card.toHighPct.toFixed(1)}`
                            : undefined
                        }
                      />
                      <Metric
                        label="Gün içi dip"
                        value={
                          card.dayLow != null
                            ? money(card.dayLow, card.currency)
                            : '—'
                        }
                        tip={DIST_TIP}
                        tipTitle="Mesafe"
                        sub={
                          card.toLowPct != null
                            ? `mesafe %${card.toLowPct.toFixed(1)}`
                            : undefined
                        }
                      />
                      <Metric
                        label="F/K"
                        value={
                          card.trailingPE != null && card.trailingPE > 0
                            ? card.trailingPE.toFixed(1)
                            : '—'
                        }
                        tip={PE_TIP}
                        tipTitle="F/K Oranı"
                      />
                      <Metric
                        label="Hacim"
                        value={card.volume || '—'}
                        tip="Canlı işlem hacmi. Yüksek hacim, sinyalin likidite desteğini güçlendirir."
                        tipTitle="Hacim"
                      />
                    </>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Neden bu varlık?
                </h3>
                <ul className="space-y-2">
                  {card.catalysts.map((c) => (
                    <li
                      key={c}
                      className="flex gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-300"
                    >
                      <span className="mt-0.5 text-emerald-500">+</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2 pb-6">
                <button
                  type="button"
                  onClick={() => setAlertOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition hover:bg-emerald-400"
                >
                  <Bell className="size-4" />
                  Bu Varlıktan Alarm Kur
                </button>
                <button
                  type="button"
                  onClick={() =>
                    starred
                      ? removeSymbol(card.symbol)
                      : addSymbol(card.symbol)
                  }
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition',
                    starred
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:border-emerald-500/40'
                  )}
                >
                  <Star
                    className={cn('size-4', starred && 'fill-amber-300')}
                  />
                  {starred
                    ? 'İzleme Listesinde'
                    : 'İzleme Listeme Ekle'}
                </button>
                <Link
                  href={`/compare?a=${encodeURIComponent(compareA)}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/40 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-emerald-500/40 hover:text-emerald-400"
                >
                  <GitCompare className="size-4" />
                  1v1 Kıyasla
                </Link>
                {card.href ? (
                  <Link
                    href={card.href}
                    className="block text-center text-xs text-emerald-400 hover:underline"
                  >
                    Tam varlık sayfasına git →
                  </Link>
                ) : null}
              </section>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertModal
        open={alertOpen}
        onOpenChange={setAlertOpen}
        symbol={card.symbol}
        displaySymbol={card.displaySymbol}
        currentPrice={card.price}
        changePercent={card.changePercent}
      />
    </>
  );
}

function Metric({
  label,
  value,
  tip,
  tipTitle,
  sub,
}: {
  label: string;
  value: string;
  tip: string;
  tipTitle: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
      <HintTooltip content={tip} title={tipTitle} className="text-[10px] uppercase tracking-wide text-zinc-500">
        {label}
      </HintTooltip>
      <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-zinc-100">
        {value}
      </p>
      {sub ? (
        <p className="mt-0.5 text-[10px] text-emerald-400">{sub}</p>
      ) : null}
    </div>
  );
}
