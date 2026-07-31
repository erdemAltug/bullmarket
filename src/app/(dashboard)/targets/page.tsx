'use client';

import Link from 'next/link';
import { Crosshair } from 'lucide-react';
import {
  ProtectedFeature,
  LockedValue,
} from '@/components/auth/ProtectedFeature';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

const TARGETS = [
  {
    symbol: 'THYAO',
    name: 'Türk Hava Yolları',
    score: 8.4,
    upside: 42,
    brokers: [
      { house: 'İş Yatırım', target: 420, rating: 'AL' },
      { house: 'Garanti BBVA', target: 395, rating: 'AL' },
      { house: 'HSBC', target: 410, rating: 'AL' },
    ],
  },
  {
    symbol: 'ASELS',
    name: 'Aselsan',
    score: 7.9,
    upside: 28,
    brokers: [
      { house: 'Yapı Kredi Yatırım', target: 118, rating: 'AL' },
      { house: 'Ak Yatırım', target: 112, rating: 'TUT' },
      { house: 'Ziraat Yatırım', target: 125, rating: 'AL' },
    ],
  },
  {
    symbol: 'GARAN',
    name: 'Garanti BBVA',
    score: 7.2,
    upside: 18,
    brokers: [
      { house: 'İş Yatırım', target: 145, rating: 'AL' },
      { house: 'Deutsche Bank', target: 138, rating: 'TUT' },
    ],
  },
  {
    symbol: 'EREGL',
    name: 'Ereğli Demir Çelik',
    score: 6.8,
    upside: 22,
    brokers: [
      { house: 'Garanti BBVA', target: 72, rating: 'AL' },
      { house: 'Şeker Yatırım', target: 68, rating: 'TUT' },
    ],
  },
];

export default function TargetsPage() {
  const { data: session } = authClient.useSession();
  const unlocked = Boolean(session?.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Crosshair className="size-6 text-amber-400" />
          Analist Hedef Fiyatları
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Kurum konsensusu, potansiyel prim ve temel analiz skoru ( /10 )
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {TARGETS.map((t) => (
          <article
            key={t.symbol}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <Link
                  href={`/bist/${t.symbol}`}
                  className="text-lg font-bold hover:text-emerald-400 hover:underline"
                >
                  {t.symbol}
                </Link>
                <p className="text-xs text-[var(--muted)]">{t.name}</p>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    'text-xl font-bold tabular-nums',
                    t.upside >= 20 ? 'text-emerald-400' : 'text-amber-400'
                  )}
                >
                  +%{t.upside}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  Potansiyel
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Temel Analiz Skoru:{' '}
              <span className="font-semibold text-[var(--foreground)]">
                {t.score}/10
              </span>
            </p>

            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Hangi Kurum Ne Dedi?
              </p>
              {unlocked ? (
                t.brokers.map((b) => (
                  <div
                    key={b.house}
                    className="flex items-center justify-between rounded-lg bg-[var(--surface)]/50 px-3 py-2 text-sm"
                  >
                    <span>{b.house}</span>
                    <span className="tabular-nums text-emerald-400">
                      ₺{b.target} · {b.rating}
                    </span>
                  </div>
                ))
              ) : (
                <ProtectedFeature featureTitle="Kurum Hedef Listesi">
                  <div className="space-y-2">
                    {t.brokers.map((b) => (
                      <div
                        key={b.house}
                        className="flex justify-between rounded-lg bg-[var(--surface)]/50 px-3 py-2 text-sm"
                      >
                        <span>{b.house}</span>
                        <span>₺{b.target}</span>
                      </div>
                    ))}
                  </div>
                </ProtectedFeature>
              )}
            </div>
          </article>
        ))}
      </div>

      {!unlocked ? (
        <p className="text-center text-xs text-[var(--muted)]">
          Örnek:{' '}
          <LockedValue feature="Broker adı">??? Yatırım — Hedef ₺420</LockedValue>
        </p>
      ) : null}
    </div>
  );
}
