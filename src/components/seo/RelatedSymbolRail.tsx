import Link from 'next/link';
import { BIST30_SYMBOLS } from '@/lib/bist-symbols';
import { peersFor } from '@/lib/sector-peers';
import { compareHref } from '@/lib/seo/compare-pairs';
import { assetDetailHref } from '@/lib/seo/internal-links';
import { toYahooSymbol } from '@/lib/seo/symbols';

type Kind = 'bist' | 'crypto' | 'us';

const BIST30_BARE = BIST30_SYMBOLS.map((s) => s.replace(/\.IS$/i, ''));

export function RelatedSymbolRail({
  symbol,
  kind,
}: {
  symbol: string;
  kind: Kind;
}) {
  const bare = symbol.replace(/\.IS$/i, '').replace(/USDT$/i, '');

  const sectorPeers =
    kind === 'bist'
      ? (peersFor(toYahooSymbol(bare))?.peers ?? [])
          .map((p) => p.replace(/\.IS$/i, ''))
          .filter((p) => p !== bare)
          .slice(0, 8)
      : kind === 'crypto'
        ? ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'AVAXUSDT']
            .filter((s) => !s.startsWith(bare))
            .slice(0, 6)
        : ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META', 'GOOGL', 'AMD']
            .filter((s) => s !== bare)
            .slice(0, 8);

  const popular =
    kind === 'bist'
      ? BIST30_BARE.filter((s) => s !== bare).slice(0, 12)
      : kind === 'crypto'
        ? ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT']
            .filter((s) => !s.startsWith(bare))
        : ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META', 'GOOGL', 'NFLX']
            .filter((s) => s !== bare);

  const category =
    kind === 'bist' ? 'BIST' : kind === 'crypto' ? 'CRYPTO' : 'US';

  const sectorTitle =
    kind === 'bist'
      ? 'Aynı sektördeki hisseler'
      : kind === 'crypto'
        ? 'Benzer kripto pariteleri'
        : 'Popüler NASDAQ hisseleri';

  const popularTitle =
    kind === 'bist'
      ? 'En çok incelenen BİST 30 hisseleri'
      : kind === 'crypto'
        ? 'En çok incelenen kripto'
        : 'En çok incelenen ABD hisseleri';

  return (
    <div className="space-y-4">
      {sectorPeers.length ? (
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
          <h2 className="mb-3 text-base font-semibold text-zinc-100">
            {sectorTitle}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {sectorPeers.map((p) => {
              const href = assetDetailHref(p, category);
              if (!href) return null;
              return (
                <li key={p} className="flex gap-1">
                  <Link
                    href={href}
                    className="inline-block rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-emerald-400 hover:border-emerald-500/40"
                  >
                    {p.replace('USDT', '')}
                  </Link>
                  {kind === 'bist' ? (
                    <Link
                      href={compareHref(bare, p)}
                      className="inline-block rounded-lg border border-zinc-700 px-2 py-1.5 text-xs text-zinc-400 hover:border-amber-500/40 hover:text-amber-300"
                    >
                      vs
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
        <h2 className="mb-3 text-base font-semibold text-zinc-100">
          {popularTitle}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {popular.map((p) => {
            const href = assetDetailHref(p, category);
            if (!href) return null;
            return (
              <li key={p}>
                <Link
                  href={href}
                  className="inline-block rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-emerald-500/40"
                >
                  {p.replace('USDT', '')}
                </Link>
              </li>
            );
          })}
          {kind === 'bist' ? (
            <li>
              <Link
                href={`/bist/${bare}/hedef-fiyat`}
                className="inline-block rounded-lg border border-amber-700/50 px-3 py-1.5 text-sm text-amber-300 hover:border-amber-500/40"
              >
                {bare} hedef fiyat
              </Link>
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
