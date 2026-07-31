interface FinancialSchemaProps {
  symbol: string;
  name?: string;
  price: number;
  currency?: string;
  changePercent?: number;
}

export function FinancialSchema({
  symbol,
  name,
  price,
  currency = 'TRY',
}: FinancialSchemaProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: name || symbol,
    tickerSymbol: symbol,
    category: 'Finance',
    offers: {
      '@type': 'Offer',
      price: Number(price.toFixed(4)),
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
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
