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

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bullsye',
    url: SITE_URL,
    inLanguage: ['tr-TR', 'en-US'],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
