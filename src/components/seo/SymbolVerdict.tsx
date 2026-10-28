import Link from 'next/link';
import { buildSymbolVerdict, moveDirection } from '@/lib/seo/symbol-verdict';
import type { NewsItem } from '@/types';

type FactLink = { href: string; label: string };

function when(iso: string): string | null {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return null;
  return new Date(at).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SymbolVerdict({
  symbol,
  price,
  changePercent,
  currencySymbol,
  dayHigh,
  dayLow,
  bandScope,
  targetMean,
  dividendYield,
  links,
  headlines,
}: {
  symbol: string;
  price: number;
  changePercent: number;
  currencySymbol: string;
  dayHigh: number | null;
  dayLow: number | null;
  bandScope: 'gün' | '24 saat';
  targetMean: number | null;
  dividendYield: number | null | undefined;
  links: FactLink[];
  headlines: NewsItem[];
}) {
  const direction = moveDirection(changePercent);
  const why =
    direction === 'down'
      ? `${symbol} neden düşüyor`
      : direction === 'up'
        ? `${symbol} neden yükseliyor`
        : `${symbol} bugün neden yatay`;
  const verdict = buildSymbolVerdict({
    symbol,
    price,
    changePercent,
    currencySymbol,
    dayHigh,
    dayLow,
    bandScope,
    targetMean,
    dividendYield,
  });

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm leading-relaxed">
      <h2 className="text-base font-semibold text-[var(--foreground)]">{symbol} bugün</h2>
      <p className="mt-2 text-[var(--muted)]">{verdict}</p>

      {links.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex rounded-md border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)] hover:border-[var(--accent)]/40"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {headlines.length > 0 ? (
        <>
          <h2 className="mt-5 text-base font-semibold text-[var(--foreground)]">{why}</h2>
          <h3 className="mt-1 text-sm font-medium text-[var(--foreground)]">
            {symbol} hisse yorum
          </h3>
          <p className="mt-2 text-[var(--muted)]">
            Son 72 saatte eşleşen başlıklar. Başlık, hareketin gerekçesi olarak yazılmamıştır.
          </p>
          <ul className="mt-3 space-y-3">
            {headlines.map((item) => {
              const stamp = when(item.publishedAt);
              return (
                <li key={item.id}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                  >
                    {item.title}
                  </a>
                  <p className="text-xs text-[var(--muted)]">
                    {[item.source, stamp].filter(Boolean).join(' · ')}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </section>
  );
}
