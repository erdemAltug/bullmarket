import type { Metadata } from 'next';
import Link from 'next/link';
import { asc, desc, eq } from 'drizzle-orm';
import { getDb, isDatabaseConfigured } from '@/db';
import { marketScores, type MarketScoreRow } from '@/db/schema';
import { absoluteCanonical } from '@/lib/seo/canonical';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { hubOgImages } from '@/lib/seo/og';
import { cn } from '@/lib/utils';

export type RankingCategory = 'BIST' | 'US' | 'CRYPTO';
export type RankingSort = 'score' | 'gainers' | 'losers';

export interface RankingConfig {
  path: string;
  category: RankingCategory;
  sort: RankingSort;
  h1: string;
  title: string;
  description: string;
  intro: string;
  /** Short explainer paragraphs under the table. */
  notes: { heading: string; body: string }[];
  related: { href: string; label: string }[];
  limit?: number;
}

function hrefFor(row: MarketScoreRow) {
  if (row.category === 'BIST') return `/bist/${row.displaySymbol}`;
  if (row.category === 'US') return `/nasdaq/${row.symbol}`;
  if (row.category === 'CRYPTO') return `/kripto/${row.symbol}`;
  return null;
}

function money(v: number, category: string) {
  const usd = category !== 'BIST';
  return `${usd ? '$' : '₺'}${v.toLocaleString('tr-TR', { maximumFractionDigits: v >= 100 ? 2 : 4 })}`;
}

function istanbulDate() {
  return new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Istanbul',
  });
}

async function loadRows(cfg: RankingConfig): Promise<MarketScoreRow[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    const order =
      cfg.sort === 'score'
        ? [desc(marketScores.score), desc(marketScores.changePercent)]
        : cfg.sort === 'gainers'
          ? [desc(marketScores.changePercent)]
          : [asc(marketScores.changePercent)];
    return await getDb()
      .select()
      .from(marketScores)
      .where(eq(marketScores.category, cfg.category))
      .orderBy(...order)
      .limit(cfg.limit ?? 50);
  } catch {
    return [];
  }
}

export function rankingMetadata(cfg: RankingConfig): Metadata {
  return {
    title: { absolute: cfg.title },
    description: cfg.description,
    alternates: withLangAlternates(cfg.path),
    openGraph: {
      url: absoluteCanonical(cfg.path),
      title: cfg.title,
      description: cfg.description,
      images: hubOgImages(cfg.h1, 'Her 15 dakikada güncellenen canlı liste'),
    },
  };
}

/** Server-rendered ranking table fed by the 15-minute score scan. */
export async function ScoreRankingPage({ cfg }: { cfg: RankingConfig }) {
  const rows = await loadRows(cfg);
  const updated = rows[0]?.updatedAt
    ? new Date(rows[0].updatedAt).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Istanbul',
      })
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          Canlı liste · {istanbulDate()}
          {updated ? ` · ${updated} güncellemesi` : ''}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{cfg.h1}</h1>
        <p className="text-sm leading-relaxed text-[var(--muted)]">{cfg.intro}</p>
      </header>

      {rows.length ? (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[11px] uppercase tracking-wide text-[var(--muted)]">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Sembol</th>
                <th className="px-4 py-3 text-right font-medium">Fiyat</th>
                <th className="px-4 py-3 text-right font-medium">Günlük</th>
                <th className="px-4 py-3 text-right font-medium">Analiz skoru</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const href = hrefFor(r);
                return (
                  <tr key={r.symbol} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)]/60">
                    <td className="px-4 py-2.5 text-[var(--muted)] tabular-nums">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      {href ? (
                        <Link href={href} className="font-semibold hover:text-[var(--accent)]">
                          {r.displaySymbol}
                        </Link>
                      ) : (
                        <span className="font-semibold">{r.displaySymbol}</span>
                      )}
                      <span className="ml-2 hidden text-xs text-[var(--muted)] sm:inline">{r.name}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">{money(r.price, r.category)}</td>
                    <td
                      className={cn(
                        'px-4 py-2.5 text-right font-mono tabular-nums',
                        r.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      )}
                    >
                      {r.changePercent >= 0 ? '+' : ''}
                      {r.changePercent.toFixed(2)}%
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="inline-flex min-w-[2.5rem] justify-center rounded-md bg-[var(--accent)]/12 px-2 py-0.5 font-mono font-semibold text-[var(--accent)]">
                        {r.score}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">
          Liste şu an güncelleniyor. Birkaç dakika sonra tekrar bak.
        </p>
      )}

      <p className="text-xs text-[var(--muted)]">
        Liste her 15 dakikada sunucu taramasıyla yenilenir; fiyatlar gecikmeli olabilir.
        Bu sayfa bilgi amaçlıdır, al-sat tavsiyesi değildir.{' '}
        <Link href="/metodoloji" className="text-[var(--accent)] hover:underline">
          Skor nasıl hesaplanır?
        </Link>
      </p>

      {cfg.notes.map((n) => (
        <section key={n.heading} className="space-y-2 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">{n.heading}</h2>
          <p>{n.body}</p>
        </section>
      ))}

      <nav aria-label="İlgili listeler" className="flex flex-wrap gap-2">
        {cfg.related.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
