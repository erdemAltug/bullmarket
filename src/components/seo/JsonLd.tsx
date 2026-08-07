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

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Bullsye Terminal',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: `${SITE_URL}/terminal`,
    image: `${SITE_URL}/images/landing/terminal-hero.png`,
    description:
      'BİST, NASDAQ ve Kripto için yapay zeka skorları, analist hedef fiyatları ve canlı borsa terminali.',
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
      'AI Portföy Doktoru',
    ],
  };

  const financialProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: 'Bullsye Canlı Piyasa Terminali',
    description:
      'Ücretsiz canlı BİST, NASDAQ, kripto ve fon izleme; AI fırsat skoru ve analist hedefleri.',
    url: SITE_URL,
    provider: {
      '@type': 'Organization',
      name: 'Bullsye',
      url: SITE_URL,
    },
    feesAndCommissionsSpecification: 'Ücretsiz kullanım',
    category: 'Market data & analytics',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(financialProductSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
