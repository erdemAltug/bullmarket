'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Mail, Sunrise } from 'lucide-react';
import { SignupCta } from '@/components/landing/SignupCta';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { buildPotentialCards } from '@/lib/ai-opportunity';
import { cn, formatPercent } from '@/lib/utils';

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
      <div
        className="h-full rounded-full bg-[var(--accent)]"
        style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
      />
    </div>
  );
}

/**
 * Live "today's top scores" teaser. The first three are fully visible; the
 * rest fade behind the morning-digest pitch (they stay public on /firsatlar).
 */
export function TodayPicks() {
  const { data, isLoading } = useMarketScanner();
  const cards = useMemo(() => {
    const ranked = buildPotentialCards(data ?? [], 30);
    const bist = ranked.filter((c) => c.category === 'BIST');
    return [...bist, ...ranked.filter((c) => c.category !== 'BIST')].slice(0, 6);
  }, [data]);
  const top = cards.slice(0, 3);
  const rest = cards.slice(3);
  const today = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    timeZone: 'Europe/Istanbul',
  });

  return (
    <section
      id="bugun"
      className="scroll-mt-20 border-b border-[var(--border)] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-[var(--accent)]" />
              </span>
              Canlı · {today}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Bugün öne çıkan skorlar
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Fiyat, hacim, F/K ve gün içi bant tek bir 0–100 skora iner.
            </p>
          </div>
          <Link
            href="/firsatlar"
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Tüm tarama →
          </Link>
        </div>

        <ul className="mt-8 grid gap-3 md:grid-cols-3">
          {(top.length ? top : [null, null, null]).map((c, i) =>
            c ? (
              <li key={c.symbol}>
                <Link
                  href={c.href ?? '/firsatlar'}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-[var(--muted)]">#{i + 1}</p>
                      <p className="text-lg font-semibold group-hover:text-[var(--accent)]">
                        {c.displaySymbol}
                      </p>
                      <p className="line-clamp-1 text-xs text-[var(--muted)]">
                        {c.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-2xl font-bold tabular-nums text-[var(--accent)]">
                        {c.score}
                      </p>
                      <p
                        className={cn(
                          'text-xs tabular-nums',
                          c.changePercent >= 0
                            ? 'text-[var(--up)]'
                            : 'text-[var(--down)]'
                        )}
                      >
                        {formatPercent(c.changePercent)}
                      </p>
                    </div>
                  </div>
                  <ScoreBar score={c.score} />
                  {c.catalysts[0] ? (
                    <p className="text-xs text-[var(--muted)]">
                      {c.catalysts[0]}
                    </p>
                  ) : null}
                </Link>
              </li>
            ) : (
              <li
                key={`sk-${i}`}
                className={cn(
                  'h-36 rounded-2xl border border-[var(--border)] bg-[var(--card)]',
                  isLoading && 'animate-pulse'
                )}
              />
            )
          )}
        </ul>

        <div className="relative mt-3 overflow-hidden rounded-2xl border border-[var(--border)]">
          <ul aria-hidden className="divide-y divide-[var(--border)] blur-[3px] select-none">
            {(rest.length ? rest : [null, null, null]).map((c, i) => (
              <li
                key={c?.symbol ?? `r-${i}`}
                className="flex items-center justify-between gap-3 bg-[var(--card)] px-5 py-3 text-sm"
              >
                <span className="font-semibold">{c?.displaySymbol ?? '·····'}</span>
                <span className="font-mono text-[var(--accent)]">
                  {c?.score ?? '··'}
                </span>
              </li>
            ))}
          </ul>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--background)]/70 px-4 text-center backdrop-blur-[1px] sm:flex-row sm:gap-5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Sunrise className="size-4 shrink-0 text-amber-300" />
              Listenin tamamı hafta içi her sabah 08:30’da e-postanda.
            </p>
            <SignupCta where="picks" className="px-4 py-2.5">
              <Mail className="size-4" /> Sabah özetini al
            </SignupCta>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-[var(--muted)]">
          Skorlar canlı metriklerden hesaplanır; yatırım tavsiyesi değildir.
        </p>
      </div>
    </section>
  );
}
