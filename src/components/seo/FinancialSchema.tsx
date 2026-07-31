import { SITE_URL } from '@/lib/seo/symbols';

interface FinancialSchemaProps {
  symbol: string;
  name?: string;
  price: number;
  currency?: string;
  changePercent?: number;
  kind?: 'bist' | 'crypto' | 'fx';
}

export function FinancialSchema({
  symbol,
  name,
  price,
  currency = 'TRY',
  kind = 'bist',
}: FinancialSchemaProps) {
  const displayName = name || symbol;
  const pageUrl =
    kind === 'crypto'
      ? `${SITE_URL}/crypto/${symbol.endsWith('USDT') ? symbol : `${symbol}USDT`}`
      : kind === 'fx'
        ? `${SITE_URL}/fx/${symbol}`
        : `${SITE_URL}/bist/${symbol.replace('.IS', '')}`;

  const jsonLd =
    kind === 'bist'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Corporation',
          name: displayName,
          tickerSymbol: symbol.replace('.IS', ''),
          url: pageUrl,
          description: `${displayName} (${symbol}) canlı hisse fiyatı, analist hedefleri ve temel analiz — Bullsye.`,
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: displayName,
          description: `${displayName} canlı fiyat ve analiz — Bullsye.`,
          url: pageUrl,
          offers: {
            '@type': 'Offer',
            price: Number(price.toFixed(4)),
            priceCurrency: currency,
            url: pageUrl,
          },
        };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
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
      item: `${SITE_URL}${item.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
