import Link from 'next/link';
import { SITE_URL } from '@/lib/seo/symbols';

interface SymbolDirectoryProps {
  title: string;
  description: string;
  symbols: readonly string[];
  kind: 'bist' | 'us' | 'crypto';
}

export function SymbolDirectory({
  title,
  description,
  symbols,
  kind,
}: SymbolDirectoryProps) {
  const hrefFor = (symbol: string) =>
    kind === 'bist'
      ? `/bist/${symbol.replace(/\.IS$/i, '')}`
      : kind === 'us'
        ? `/us/${symbol}`
        : `/crypto/${symbol}`;

  const labelFor = (symbol: string) =>
    symbol.replace(/\.IS$/i, '').replace(/USDT$/i, '');
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    numberOfItems: symbols.length,
    itemListElement: symbols.map((symbol, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${labelFor(symbol)} canlı fiyat ve analiz`,
      url: `${SITE_URL}${hrefFor(symbol)}`,
    })),
  };

  return (
    <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 p-4 sm:p-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <div className="max-w-3xl">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
          {description}
        </p>
      </div>
      <nav
        aria-label={`${title} sembol dizini`}
        className="mt-4 grid grid-cols-3 gap-1.5 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9"
      >
        {symbols.map((symbol) => (
          <Link
            key={symbol}
            href={hrefFor(symbol)}
            title={`${labelFor(symbol)} canlı fiyat ve analiz`}
            className="truncate rounded-md border border-[var(--border)] bg-[var(--surface)]/50 px-2 py-1.5 text-center text-[11px] font-medium text-[var(--muted)] transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
          >
            {labelFor(symbol)}
          </Link>
        ))}
      </nav>
    </section>
  );
}
