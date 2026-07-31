'use client';

import { useQuery } from '@tanstack/react-query';
import { Sparkles, Target, ShieldAlert } from 'lucide-react';
import {
  ProtectedFeature,
  LockedValue,
} from '@/components/auth/ProtectedFeature';
import { authClient } from '@/lib/auth/client';
import type { ApiResponse, TradeSignal } from '@/types';
import { cn } from '@/lib/utils';

async function getSignals(): Promise<TradeSignal[]> {
  const res = await fetch(
    '/api/signals?symbols=THYAO.IS,GARAN.IS,ASELS.IS,EREGL.IS,BTCUSDT,ETHUSDT,SOLUSDT'
  );
  const json = (await res.json()) as ApiResponse<{ signals: TradeSignal[] }>;
  if (!json.success) throw new Error(json.error);
  return json.data.signals;
}

/** Demo enrichment for entry / stop / target when locked preview */
function levels(price: number, kind: string) {
  const buy = kind.includes('overbought') || kind.includes('down');
  const entry = price;
  const stop = buy ? price * 1.03 : price * 0.97;
  const target = buy ? price * 0.94 : price * 1.06;
  return { entry, stop, target };
}

export default function SignalsPage() {
  const { data: session } = authClient.useSession();
  const unlocked = Boolean(session?.user);
  const { data: signals = [], isLoading, error } = useQuery({
    queryKey: ['signals-page'],
    queryFn: getSignals,
    staleTime: 60_000,
  });

  const free = signals.slice(0, 2);
  const gated = signals.slice(2, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Sparkles className="size-6 text-emerald-400" />
          AI Signal Radar
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Yapay zeka destekli alım / satım sinyalleri — giriş, stop ve hedef
          seviyeleri
        </p>
      </div>

      {error ? (
        <p className="text-sm text-rose-400">{(error as Error).message}</p>
      ) : null}
      {isLoading ? (
        <p className="text-sm text-[var(--muted)]">Sinyaller taranıyor…</p>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {free.map((s) => {
          const lv = levels(s.price, s.kind);
          return (
            <article
              key={`${s.symbol}-${s.kind}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-bold text-[var(--foreground)]">
                    {s.displaySymbol}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{s.label}</p>
                </div>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase',
                    s.kind.includes('up') || s.kind.includes('oversold')
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                  )}
                >
                  AI
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-[var(--surface)]/60 p-2">
                  <dt className="text-[var(--muted)]">Giriş</dt>
                  <dd className="mt-1 font-semibold tabular-nums">
                    {unlocked ? (
                      lv.entry.toFixed(2)
                    ) : (
                      <LockedValue feature="AI Giriş Fiyatı">
                        {lv.entry.toFixed(2)}
                      </LockedValue>
                    )}
                  </dd>
                </div>
                <div className="rounded-lg bg-[var(--surface)]/60 p-2">
                  <dt className="inline-flex items-center justify-center gap-1 text-[var(--muted)]">
                    <ShieldAlert className="size-3" /> Stop
                  </dt>
                  <dd className="mt-1 font-semibold tabular-nums">
                    {unlocked ? (
                      lv.stop.toFixed(2)
                    ) : (
                      <LockedValue feature="AI Stop-Loss">
                        {lv.stop.toFixed(2)}
                      </LockedValue>
                    )}
                  </dd>
                </div>
                <div className="rounded-lg bg-[var(--surface)]/60 p-2">
                  <dt className="inline-flex items-center justify-center gap-1 text-[var(--muted)]">
                    <Target className="size-3" /> Hedef
                  </dt>
                  <dd className="mt-1 font-semibold tabular-nums">
                    {unlocked ? (
                      lv.target.toFixed(2)
                    ) : (
                      <LockedValue feature="AI Hedef Fiyat">
                        {lv.target.toFixed(2)}
                      </LockedValue>
                    )}
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>

      {gated.length > 0 ? (
        <ProtectedFeature featureTitle="AI Signal Radar">
          <div className="grid gap-3 md:grid-cols-2">
            {gated.map((s) => {
              const lv = levels(s.price, s.kind);
              return (
                <article
                  key={`${s.symbol}-${s.kind}-g`}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                >
                  <p className="text-lg font-bold">{s.displaySymbol}</p>
                  <p className="text-xs text-[var(--muted)]">{s.label}</p>
                  <p className="mt-3 text-sm tabular-nums">
                    Giriş {lv.entry.toFixed(2)} · Stop {lv.stop.toFixed(2)} ·
                    Hedef {lv.target.toFixed(2)}
                  </p>
                </article>
              );
            })}
          </div>
        </ProtectedFeature>
      ) : null}

      {!isLoading && signals.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Şu an aktif sinyal yok — kısa süre sonra tekrar deneyin.
        </p>
      ) : null}
    </div>
  );
}
