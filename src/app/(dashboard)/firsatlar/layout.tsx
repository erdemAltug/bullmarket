import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'BİST Skor Taraması: Analiz Skoru (0–100)',
  description:
    'Ücretsiz BİST taraması: analiz skoru (0–100), gün içi bant ve hacim. Kayıt olmadan günlük tarama.',
  keywords: [
    'BİST tarama',
    'hisse analiz skoru',
    'BİST alım sinyali',
    'NASDAQ tarama',
    'canlı piyasa taraması',
    'Bullsye skor',
  ],
  alternates: withLangAlternates('/firsatlar'),
  openGraph: {
    title: 'BİST Skor Taraması ve Analiz Skoru | Bullsye',
    description:
      'Analiz skoru, bant ve hacim — ücretsiz günlük BİST taraması.',
    url: `${SITE_URL}/firsatlar`,
  },
};

const FAQ = [
  {
    q: 'Analiz skoru nasıl hesaplanır?',
    a: 'Bullsye skoru canlı F/K, 24s hacim ivmesi ve gün içi high/low bant pozisyonunun ağırlıklı ortalamasıyla üretilir. Uydurma hedef fiyat gösterilmez.',
  },
  {
    q: 'Tarama ne sıklıkla yenilenir?',
    a: 'Piyasa taraması yaklaşık her 10 saniyede yenilenir. Yeni yüksek skorlu kartlar alt barda görünür.',
  },
  {
    q: 'Ücretsiz ne kadar görebilirim?',
    a: 'Misafirler genişletilmiş önizleme görür. Tam sinyal listesi ve senkron alarm için ücretsiz hesap yeterlidir.',
  },
];

export default function FirsatlarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      {children}
      <section className="mx-auto mt-10 max-w-3xl space-y-4 border-t border-[var(--border)] px-1 pb-8 pt-8">
        <h2 className="text-lg font-semibold tracking-tight">
          Sık sorulan sorular
        </h2>
        <dl className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.q}>
              <dt className="text-sm font-medium text-[var(--foreground)]">
                {item.q}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
