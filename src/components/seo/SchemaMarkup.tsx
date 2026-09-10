import { SITE_URL } from '@/lib/seo/symbols';

const FAQ = [
  {
    question: 'Analist tavsiyeleri ve hedef fiyatları nerede?',
    answer:
      'Ücretsiz /targets sayfasında BİST kurum konsensüsü, ortalama/yüksek/düşük hedef ve potansiyel prim yer alır. Her hisse sayfasında da aynı kutu vardır. Yatırım tavsiyesi değildir.',
  },
  {
    question: 'Bullsye analiz skoru neye göre hesaplanır?',
    answer:
      'Canlı F/K rasyoları, 24 saatlik hacim ivmesi, teknik indikatörler (RSI, hareketli ortalamalar) ve gün içi bant pozisyonlarının ağırlıklı algoritmasıyla 100 üzerinden hesaplanır.',
  },
  {
    question: 'Finansal okuryazarlık ve finansal özgürlük nedir — Bullsye ne sunar?',
    answer:
      'Okuryazarlık kendi envanterini (hisse, nakit, mevduat, alarm) okuyabilmektir. Finansal özgürlük bir getiri vaadi değildir. Bullsye asistanı bu tabloyu unutturmamak içindir; yatırım tavsiyesi vermez.',
  },
  {
    question: 'Bullsye terminalini kullanmak ücretsiz mi?',
    answer:
      'Evet. Canlı borsa verilerini, analiz skorlarını ve analist hedef fiyatlarını ücretsiz terminal üzerinden takip edebilirsiniz.',
  },
  {
    question: 'Hangi borsaların verileri yer alıyor?',
    answer:
      'BİST 100, NASDAQ, S&P 500, kripto (Binance) ve TEFAS yatırım fonları canlı olarak taranır.',
  },
  {
    question: 'Bullsye yatırım tavsiyesi verir mi?',
    answer:
      'Hayır. Bullsye’daki hiçbir veri yatırım tavsiyesi niteliğinde değildir. Kararlarınızı kendi araştırmanız ve risk profilinizle alın.',
  },
  {
    question: 'Skor taramasına nasıl ulaşıyorum?',
    answer: `Ücretsiz kayıt olmadan ${SITE_URL}/firsatlar ve ${SITE_URL}/terminal üzerinden canlı skorları görebilirsiniz.`,
  },
] as const;

/** Rich-snippet schemas for SERP vertical space (FAQ + SoftwareApplication). */
export function SchemaMarkup() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Bullsye — Canlı Borsa & Analiz Taraması',
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'Stock Market Analysis',
    operatingSystem: 'Web Browser',
    url: SITE_URL,
    image: `${SITE_URL}/images/landing/terminal-hero.png`,
    screenshot: `${SITE_URL}/images/landing/terminal-radar.png`,
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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
