import { SITE_URL } from '@/lib/seo/symbols';
import { absoluteCanonical } from '@/lib/seo/canonical';

interface FinancialSchemaProps {
  symbol: string;
  name?: string;
  price: number;
  currency?: string;
  changePercent?: number;
  kind?: 'bist' | 'crypto' | 'fx' | 'us';
  path?: string;
}

export function FinancialSchema({
  symbol,
  name,
  price,
  currency = 'TRY',
  kind = 'bist',
  path,
}: FinancialSchemaProps) {
  const displayName = name || symbol;
  const pageUrl = path
    ? absoluteCanonical(path, { upperSymbol: true })
    : kind === 'crypto'
      ? absoluteCanonical(
          `/kripto/${symbol.endsWith('USDT') ? symbol : `${symbol}USDT`}`,
          { upperSymbol: true }
        )
      : kind === 'fx'
        ? absoluteCanonical(`/fx/${symbol}`)
        : kind === 'us'
          ? absoluteCanonical(`/nasdaq/${symbol}`, { upperSymbol: true })
          : absoluteCanonical(`/bist/${symbol.replace('.IS', '')}`, {
              upperSymbol: true,
            });

  const exchange =
    kind === 'bist'
      ? 'Borsa Istanbul'
      : kind === 'us'
        ? 'NASDAQ'
        : kind === 'crypto'
          ? 'Crypto'
          : 'FX';

  const itemPage = {
    '@context': 'https://schema.org',
    '@type': 'ItemPage',
    name: `${displayName} (${symbol.replace('.IS', '')}) canlı analiz`,
    url: pageUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Bullsye',
      url: SITE_URL,
    },
    about: {
      '@type': 'FinancialProduct',
      name: displayName,
      category: exchange,
      ...(price > 0
        ? {
            offers: {
              '@type': 'Offer',
              price: Number(price.toFixed(4)),
              priceCurrency: currency,
              url: pageUrl,
              availability: 'https://schema.org/InStock',
            },
          }
        : {}),
    },
  };

  const corp =
    kind === 'bist' || kind === 'us'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Corporation',
          name: displayName,
          tickerSymbol: symbol.replace('.IS', ''),
          url: pageUrl,
          description: `${displayName} (${symbol}) canlı hisse fiyatı, analist hedefleri ve temel analiz — Bullsye.`,
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemPage) }}
      />
      {corp ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(corp) }}
        />
      ) : null}
    </>
  );
}

interface FaqSchemaProps {
  items: { question: string; answer: string }[];
}

export function FaqSchema({ items }: FaqSchemaProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteCanonical(item.path),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
