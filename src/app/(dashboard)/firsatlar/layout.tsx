import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'BİST Alım Fırsatı: Canlı AI Fırsat Skoru (0–100)',
  description:
    'Ücretsiz BİST alım fırsatı taraması: canlı AI fırsat skoru (0–100), gün içi bant ve hacim. Kayıt olmadan günlük tarama.',
  keywords: [
    'AI alım fırsatı',
    'anlık hisse fırsatı',
    'BİST alım sinyali',
    'kripto fırsat',
    'NASDAQ fırsat',
    'canlı trading fırsat',
    'AI fırsat radarı',
  ],
  alternates: withLangAlternates('/firsatlar'),
  openGraph: {
    title: 'BİST Alım Fırsatı ve AI Fırsat Skoru | Bullsye',
    description:
      'Canlı fırsat skoru, bant ve hacim — ücretsiz günlük BİST taraması.',
    url: `${SITE_URL}/firsatlar`,
  },
};

const FAQ = [
  {
    q: 'AI fırsat alımları nasıl hesaplanır?',
    a: 'Bullsye skoru canlı F/K, 24s hacim ivmesi ve gün içi high/low bant pozisyonunun ağırlıklı ortalamasıyla üretilir. Uydurma hedef fiyat gösterilmez.',
  },
  {
    q: 'Fırsat masası ne sıklıkla yenilenir?',
    a: 'Piyasa taraması yaklaşık her 10 saniyede yenilenir. Yeni yüksek skorlu kartlar sticky barda ve “yeni fırsat” rozetinde görünür.',
  },
  {
    q: 'Ücretsiz ne kadar görebilirim?',
    a: 'Misafirler genişletilmiş önizleme görür; üst üste gün ziyaretinde seri ile ekstra kart açılır. Tam sinyal listesi ve senkron alarm için ücretsiz hesap yeterlidir.',
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
