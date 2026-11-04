import { SITE_URL } from '@/lib/seo/symbols';

/** SoftwareApplication schema; the visible FAQ on the page carries its own FAQPage. */
export function SchemaMarkup() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Bullsye — Canlı Borsa & Analiz Taraması',
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'Stock Market Analysis',
    operatingSystem: 'Web Browser',
    url: SITE_URL,
    image: `${SITE_URL}/og-image.png`,
    description:
      'BİST 100 ve kripto için 100 üzerinden analiz skorları, analist hedef fiyatları ve portföy risk taraması. Ücretsiz finans terminali.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TRY',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'Analiz skoru (0–100)',
      'BİST 100 hisse analizi',
      'Analist hedef fiyat konsensüsü',
      'Kripto skor taraması',
      'Portföy risk taraması',
      'Fiyat alarmları',
      'Temettü karnesi',
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Bullsye',
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  );
}
