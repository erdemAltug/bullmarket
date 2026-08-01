'use client';

import Link from 'next/link';
import { Waves } from 'lucide-react';
import { ProtectedFeature } from '@/components/auth/ProtectedFeature';
import { authClient } from '@/lib/auth/client';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { cn } from '@/lib/utils';

/** Live volume / momentum leaders — no mock foreign-flow or whale alerts */
export default function SmartMoneyPage() {
  const { data: session } = authClient.useSession();
  const unlocked = Boolean(session?.user);
  const { data, error, isLoading } = useMarketScanner();

  const bistLeaders = (data ?? [])
    .filter((i) => i.category === 'BIST' && !i.displaySymbol.includes('XU'))
    .sort((a, b) => Math.abs(b.changePercent) * b.volumeRaw - Math.abs(a.changePercent) * a.volumeRaw)
    .slice(0, 8);

  const cryptoLeaders = (data ?? [])
    .filter((i) => i.category === 'CRYPTO')
    .sort((a, b) => b.volumeRaw - a.volumeRaw)
    .slice(0, 6);

  const freeCount = unlocked ? bistLeaders.length : 3;
  const visible = bistLeaders.slice(0, freeCount);
  const locked = bistLeaders.slice(freeCount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Waves className="size-6 text-cyan-400" />
          Hacim & Momentum Liderleri
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Canlı hacim × fiyat değişimi — net takas / balina akışı iddiası yok
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
            <h2 className="text-sm font-semibold">
              BİST — En güçlü hacim × hareket (canlı)
            </h2>
            <ul className="mt-4 space-y-2">
              {visible.map((r, idx) => (
                <li
                  key={r.symbol}
                  className="flex items-center justify-between rounded-lg bg-[var(--surface)]/50 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-400">
                      {idx + 1}
                    </span>
                    <div>
                      <Link
                        href={`/bist/${r.displaySymbol}`}
                        className="font-semibold hover:text-emerald-400 hover:underline"
                      >
                        {r.displaySymbol}
                      </Link>
                      <p className="text-xs text-[var(--muted)]">{r.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'text-sm font-bold tabular-nums',
                        r.changePercent >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      )}
                    >
                      {r.changePercent >= 0 ? '+' : ''}
                      {r.changePercent.toFixed(2)}%
                    </p>
                    <p className="text-[10px] text-[var(--muted)]">
                      Hacim {r.volume}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {!unlocked && locked.length > 0 ? (
              <div className="mt-3">
                <ProtectedFeature featureTitle="Tam Hacim Liderleri">
                  <ul className="space-y-2">
                    {locked.map((r, idx) => (
                      <li
                        key={r.symbol}
                        className="flex justify-between rounded-lg bg-[var(--surface)]/50 px-3 py-2.5"
                      >
                        <span>
                          #{freeCount + idx + 1} {r.displaySymbol}
                        </span>
                        <span>{r.changePercent.toFixed(2)}%</span>
                      </li>
                    ))}
                  </ul>
                </ProtectedFeature>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h2 className="text-sm font-semibold">
              Kripto — En yüksek 24s hacim
            </h2>
            <ul className="mt-4 space-y-2">
              {cryptoLeaders.map((r) => (
                <li
                  key={r.symbol}
                  className="flex items-center justify-between rounded-lg bg-[var(--surface)]/50 px-3 py-2.5"
                >
                  <Link
                    href={`/crypto/${r.symbol}`}
                    className="font-semibold hover:text-emerald-400 hover:underline"
                  >
                    {r.displaySymbol}
                  </Link>
                  <div className="text-right text-sm">
                    <span
                      className={
                        r.changePercent >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }
                    >
                      {r.changePercent >= 0 ? '+' : ''}
                      {r.changePercent.toFixed(2)}%
                    </span>
                    <span className="ml-2 text-[10px] text-[var(--muted)]">
                      {r.volume}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
