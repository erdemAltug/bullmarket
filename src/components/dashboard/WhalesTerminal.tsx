'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownRight,
  ArrowUpRight,
  Fish,
  Waves,
} from 'lucide-react';
import { ProtectedFeature } from '@/components/auth/ProtectedFeature';
import { authClient } from '@/lib/auth/client';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import {
  rankInstitutionalFlows,
  volumeProxyWhaleEvents,
  type CryptoWhaleEvent,
} from '@/lib/smart-money';
import { cn } from '@/lib/utils';

function formatUsd(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function timeAgo(ts: number) {
  const sec = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (sec < 60) return `${sec}sn`;
  if (sec < 3600) return `${Math.floor(sec / 60)}dk`;
  return `${Math.floor(sec / 3600)}sa`;
}

export function WhalesTerminal() {
  const { data: session } = authClient.useSession();
  const unlocked = Boolean(session?.user);
  const { data, error, isLoading } = useMarketScanner();

  const flows = rankInstitutionalFlows(data ?? [], 12);
  const freeCount = unlocked ? flows.length : 4;
  const visible = flows.slice(0, freeCount);
  const locked = flows.slice(freeCount);

  const whaleQuery = useQuery({
    queryKey: ['whale-agg-trades'],
    queryFn: async () => {
      const res = await fetch('/api/whales');
      const json = (await res.json()) as {
        success: boolean;
        data?: { events: CryptoWhaleEvent[]; note?: string };
        error?: string;
      };
      if (!json.success && !json.data?.events?.length) {
        throw new Error(json.error || 'Whale feed yok');
      }
      return json.data ?? { events: [] as CryptoWhaleEvent[] };
    },
    staleTime: 45_000,
    refetchInterval: 90_000,
  });

  const liveWhales = whaleQuery.data?.events ?? [];
  const proxyWhales = volumeProxyWhaleEvents(data ?? []);
  const whaleFeed =
    liveWhales.length > 0
      ? liveWhales
      : proxyWhales.slice(0, 6).map((e) => ({
          ...e,
          labelTr:
            e.side === 'buy'
              ? 'BALİNA ALIMI (24s hacim)'
              : 'BORSAYA GİRİŞ (24s hacim)',
        }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Waves className="size-6 text-cyan-400" />
          Balina & Takas Analizi
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Kurumsal ilgi proxy (hacim × momentum) ve kripto büyük işlem akışı —
          resmi KAP takas oranı değildir
        </p>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
      ) : error ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          Canlı piyasa verisi alınamadı.
        </p>
      ) : (
        <>
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="mb-1 flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-sm font-semibold">
                Kurumsal İlgi — Takas Değişimi Proxy
              </h2>
              <span className="text-[10px] text-[var(--muted)]">
                Yabancı / kurumsal akış skoru · canlı hacim
              </span>
            </div>
            <p className="mb-4 text-[11px] text-[var(--muted)]">
              Net takas oranı yerine seans hacmi × fiyat hareketi ile kurumsal
              ilgi tahmin edilir.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
                    <th className="pb-2 pr-2 font-medium">Sembol</th>
                    <th className="pb-2 pr-2 font-medium">İlgi</th>
                    <th className="pb-2 pr-2 font-medium">Değişim</th>
                    <th className="pb-2 pr-2 font-medium">Hacim</th>
                    <th className="pb-2 font-medium">Sinyal</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr
                      key={r.symbol}
                      className="border-b border-[var(--border)]/60"
                    >
                      <td className="py-2.5 pr-2">
                        <Link
                          href={`/bist/${r.displaySymbol}`}
                          className="font-semibold hover:text-emerald-400 hover:underline"
                        >
                          {r.displaySymbol}
                        </Link>
                        <p className="text-[10px] text-[var(--muted)]">
                          {r.name}
                        </p>
                      </td>
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-cyan-400"
                              style={{ width: `${r.interestScore}%` }}
                            />
                          </div>
                          <span className="tabular-nums text-xs">
                            {r.interestScore}
                          </span>
                        </div>
                      </td>
                      <td
                        className={cn(
                          'py-2.5 pr-2 font-semibold tabular-nums',
                          r.changePercent >= 0
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        )}
                      >
                        {r.changePercent >= 0 ? '+' : ''}
                        {r.changePercent.toFixed(2)}%
                      </td>
                      <td className="py-2.5 pr-2 text-xs text-[var(--muted)]">
                        {r.volume}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                            r.bias === 'accumulation' &&
                              'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
                            r.bias === 'distribution' &&
                              'border-rose-500/40 bg-rose-500/10 text-rose-300',
                            r.bias === 'neutral' &&
                              'border-[var(--border)] text-[var(--muted)]'
                          )}
                        >
                          {r.bias === 'accumulation' ? (
                            <ArrowUpRight className="size-3" />
                          ) : r.bias === 'distribution' ? (
                            <ArrowDownRight className="size-3" />
                          ) : null}
                          {r.bias === 'accumulation'
                            ? 'Kurumsal toplama'
                            : r.bias === 'distribution'
                              ? 'Dağıtım'
                              : 'Nötr'}
                        </span>
                        <p className="mt-1 max-w-[220px] text-[10px] leading-snug text-[var(--muted)]">
                          {r.narrative}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!unlocked && locked.length > 0 ? (
              <div className="mt-3">
                <ProtectedFeature featureTitle="Tam Takas Liderleri">
                  <ul className="space-y-2 text-sm">
                    {locked.map((r) => (
                      <li
                        key={r.symbol}
                        className="flex justify-between rounded-lg bg-[var(--surface)]/50 px-3 py-2"
                      >
                        <span>{r.displaySymbol}</span>
                        <span className="tabular-nums">{r.interestScore}</span>
                      </li>
                    ))}
                  </ul>
                </ProtectedFeature>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="mb-1 flex items-center gap-2">
              <Fish className="size-4 text-violet-400" />
              <h2 className="text-sm font-semibold">
                Kripto Balina Takibi — BTC · ETH · SOL
              </h2>
            </div>
            <p className="mb-4 text-[11px] text-[var(--muted)]">
              {whaleQuery.data?.note ??
                'Büyük notional işlemler ($250k+). Zincir cüzdan etiketi değil.'}
            </p>

            {whaleQuery.isLoading && liveWhales.length === 0 ? (
              <div className="h-28 animate-pulse rounded-lg bg-[var(--surface)]/50" />
            ) : whaleFeed.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                Şu an eşik üstü işlem yok — kısa süre sonra yenilenir.
              </p>
            ) : (
              <ul className="space-y-2">
                {whaleFeed.map((e) => (
                  <li
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--surface)]/50 px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Link
                        href={`/crypto/${e.symbol}`}
                        className="font-semibold hover:text-emerald-400 hover:underline"
                      >
                        {e.display}
                      </Link>
                      <span
                        className={cn(
                          'rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          e.badge === 'whale_buy'
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                            : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                        )}
                      >
                        {e.labelTr}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold tabular-nums">
                        {formatUsd(e.notionalUsd)}
                      </p>
                      <p className="text-[10px] text-[var(--muted)]">
                        {timeAgo(e.at)} önce
                        {e.source === 'volume_proxy' ? ' · proxy' : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
