'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { scoreOpportunity } from '@/lib/ai-opportunity';
import { assetDetailHref } from '@/lib/seo/internal-links';
import { cn, formatPercent } from '@/lib/utils';

const QUICK = ['THYAO', 'GARAN', 'NVDA', 'BTC', 'ASELS', 'ETH'] as const;

export function AssetChecker() {
  const { data, isLoading } = useMarketScanner();
  const [query, setQuery] = useState('THYAO');
  const [submitted, setSubmitted] = useState('THYAO');

  const hit = useMemo(() => {
    const q = submitted.trim().toUpperCase().replace(/[^A-Z0-9.]/g, '');
    if (!q || !data?.length) return null;
    const found =
      data.find((i) => i.displaySymbol.toUpperCase() === q) ??
      data.find((i) => i.symbol.toUpperCase().replace(/\.IS$/, '') === q) ??
      data.find((i) => i.displaySymbol.toUpperCase().includes(q)) ??
      data.find((i) => i.symbol.toUpperCase().includes(q));
    if (!found) return null;
    const score = scoreOpportunity(found);
    const href =
      assetDetailHref(found.symbol, found.category) ??
      `/bist/${found.displaySymbol}`;
    return { item: found, score, href };
  }, [data, submitted]);

  function run(next?: string) {
    const v = (next ?? query).trim();
    if (!v) return;
    setQuery(v);
    setSubmitted(v);
  }

  return (
    <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--card)] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid size-10 place-items-center rounded-xl border border-[var(--accent)]/30 bg-[var(--glow-up)]">
          <Sparkles className="size-5 text-[var(--accent)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            1 tıkla AI skor kontrolü
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Sembol yaz — giriş olmadan canlı fırsat skorunu gör.
          </p>
        </div>
      </div>

      <form
        className="mt-5 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="THYAO, NVDA, BTC…"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-3 text-sm font-semibold tracking-wide text-[var(--foreground)] outline-none focus:border-[var(--accent)]/50"
            aria-label="Sembol ara"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[#042f2e] hover:brightness-110"
        >
          Skoru hesapla
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => run(s)}
            className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-5 min-h-[7.5rem] rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-4">
        {isLoading && !data?.length ? (
          <p className="text-sm text-[var(--muted)]">Piyasa verisi yükleniyor…</p>
        ) : hit ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                {hit.item.category} · {hit.item.name}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums">
                {hit.item.displaySymbol}{' '}
                <span className="text-base font-semibold text-[var(--muted)]">
                  {hit.item.currency === 'USD' ? '$' : '₺'}
                  {hit.item.price.toLocaleString('tr-TR', {
                    maximumFractionDigits: hit.item.price >= 100 ? 2 : 4,
                  })}
                </span>
              </p>
              <p
                className={cn(
                  'mt-1 text-sm font-semibold',
                  hit.item.changePercent >= 0
                    ? 'text-[var(--up)]'
                    : 'text-[var(--down)]'
                )}
              >
                {formatPercent(hit.item.changePercent)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                AI Fırsat Skoru
              </p>
              <p className="font-mono text-4xl font-black text-[var(--up)]">
                {hit.score}
                <span className="text-base text-[var(--muted)]">/100</span>
              </p>
              <Link
                href={hit.href}
                prefetch
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Detay analizi
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            “{submitted}” canlı evrende bulunamadı. THYAO, NVDA veya BTC deneyin —
            ya da{' '}
            <Link href="/terminal" className="text-[var(--accent)] hover:underline">
              terminale
            </Link>{' '}
            geçin.
          </p>
        )}
      </div>
    </div>
  );
}
