import Link from 'next/link';
import { loadRows, type RankingCategory } from '@/components/seo/ScoreRankingPage';
import type { SectorDef } from '@/lib/seo/sectors';

/** One row per sector: its highest-scored member right now. */
export async function SectorLeaders({
  category,
  sectors,
  basePath,
  title = 'Sektör liderleri',
}: {
  category: RankingCategory;
  sectors: SectorDef[];
  basePath: string;
  title?: string;
}) {
  const rows = await loadRows({ category, sort: 'score', limit: 2000 });
  const bySymbol = new Map(rows.map((r) => [r.displaySymbol, r]));
  const leaders = sectors
    .map((s) => {
      const members = s.symbols.map((sym) => bySymbol.get(sym)).filter((r) => r != null);
      members.sort((a, b) => b.score - a.score);
      return { sector: s, top: members[0] ?? null, count: members.length };
    })
    .filter((x) => x.top);

  if (!leaders.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-[var(--muted)]">
        Her sektörde şu an en yüksek analiz skoruna sahip hisse. Sektör adına tıklayarak tüm listeyi görebilirsin.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {leaders.map(({ sector, top, count }) => (
          <li
            key={sector.slug}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
          >
            <div className="min-w-0">
              <Link href={`${basePath}/${sector.slug}`} className="text-sm font-semibold hover:text-[var(--accent)]">
                {sector.name}
              </Link>
              <p className="truncate text-xs text-[var(--muted)]">
                Lider:{' '}
                <Link
                  href={category === 'BIST' ? `/bist/${top!.displaySymbol}` : `/nasdaq/${top!.symbol}`}
                  className="font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                >
                  {top!.displaySymbol}
                </Link>{' '}
                · {count} hisse
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-[var(--accent)]/12 px-2 py-0.5 font-mono text-sm font-semibold text-[var(--accent)]">
              {top!.score}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
