import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'Analist Hedef Fiyatları (BİST) — Kurum Konsensüsü, Ücretsiz',
  description:
    'Analist tavsiyeleri ve hedef fiyatları: BİST kurum konsensüsü, ortalama/yüksek/düşük hedef ve potansiyel prim. Ücretsiz canlı tablo.',
  keywords: [
    'analist tavsiyeleri ve hedef fiyatları',
    'analist hedef fiyat',
    'hisse hedef fiyat',
    'kurum konsensüsü',
    'price targets',
    'stock analyst ratings',
  ],
  alternates: withLangAlternates('/targets'),
  openGraph: {
    title: 'Analist Tavsiyeleri ve Hedef Fiyatları | Bullsye',
    description:
      'BİST kurum hedef fiyatları, konsensüs ve potansiyel prim — ücretsiz.',
    url: `${SITE_URL}/targets`,
  },
};

const FAQ = [
  {
    q: 'Analist tavsiyeleri ve hedef fiyatları nedir?',
    a: 'Aracı kurumların hisse için yayımladığı AL/TUT/SAT görüşü ve 12 aylık fiyat hedefidir. Bullsye bunları ortalama, yüksek ve düşük hedef olarak özetler; yatırım tavsiyesi değildir.',
  },
  {
    q: 'Hedef fiyat ile mevcut fiyat arasındaki fark ne anlama gelir?',
    a: 'Potansiyel prim, konsensüs hedefin son fiyata göre yüzdesel mesafesidir. Yüksek prim tek başına alım sinyali değildir; skor, hacim ve riskle birlikte okunmalıdır.',
  },
  {
    q: 'Veriler ne sıklıkla güncellenir?',
    a: 'Hedef tablosu yaklaşık 5 dakikada bir yenilenir. Sembol sayfasında da aynı konsensüs satırını görebilirsiniz.',
  },
  {
    q: 'Ücretli mi?',
    a: 'Açık betada analist hedef tablosu ücretsizdir. Derin geçmiş ve sınırsız alarm ileride Pro katmanında olabilir.',
  },
];

export default function TargetsLayout({
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
      acceptedAnswer: { '@type': 'Answer', text: item.a },
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
