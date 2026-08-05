import { SITE_URL } from '@/lib/seo/symbols';

export function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bullsye',
    alternateName: ['Bullsye.app', 'Bullsye Terminal'],
    url: SITE_URL,
    logo: `${SITE_URL}/icon`,
    description:
      'Canlı BİST hisse analizi, kripto sinyal radarı, analist hedef fiyatları ve temettü takvimi sunan finans terminali.',
    sameAs: ['https://twitter.com/bullsyeapp'],
    foundingDate: '2025',
    areaServed: ['TR', 'Worldwide'],
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Bullsye Terminal',
    url: SITE_URL,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    inLanguage: ['tr-TR', 'en-US'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TRY',
    },
    featureList: [
      'BİST canlı hisse fiyatı',
      'Analist hedef fiyat konsensüsü',
      'AI alım satım sinyalleri',
      'Kripto radar',
      'Temettü takvimi',
      '1v1 varlık kıyaslama',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bullsye',
    url: SITE_URL,
    inLanguage: ['tr-TR', 'en-US'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/bist?symbol={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
