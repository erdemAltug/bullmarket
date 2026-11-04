/**
 * Groups blog posts into reader-facing topics on /blog. Posts not listed
 * fall into the last group, so a new post never disappears from the hub.
 */
export const BLOG_TOPICS = [
  {
    id: 'baslangic',
    title: 'Borsaya yeni başlayanlar',
    blurb: 'İlk hisseden portföy kurmaya, en sık yapılan hatalardan korunmaya.',
    slugs: [
      'borsada-yeni-baslayanlarin-hatalari',
      'portfoy-nasil-olusturulur',
      'enflasyona-karsi-yatirim-araclari',
      'sabah-borsa-rutini-10-dakika',
      'bullsye-gunluk-rutin-rehberi',
    ],
  },
  {
    id: 'temel',
    title: 'Temel analiz ve hedef fiyat',
    blurb: 'Bilanço, F/K, hedef fiyat ve şirket haberlerini okumak.',
    slugs: [
      'analist-hedef-fiyati-nasil-okunur',
      'analist-tavsiyeleri-ve-hedef-fiyatlari',
      'bist-hisse-senedi-temel-analiz-rehberi',
      'bilanco-nasil-okunur-bist',
      'fk-orani-nedir-bist',
      'kap-bildirimi-nasil-okunur',
      'hisse-neden-duser',
      'hisse-geri-alim-programi-nedir',
      'iki-hisse-nasil-karsilastirilir',
      'bist-100-hisse-analiz-rehberi',
      'bist-canli-analiz-nasil-yapilir',
    ],
  },
  {
    id: 'temettu',
    title: 'Temettü ve vergi',
    blurb: 'Temettü verimi, stopaj ve pasif gelir portföyü.',
    slugs: [
      'temettu-vergisi-stopaj',
      'temettu-verimi-en-yuksek-hisseler',
      'temettu-yatirimi-rehberi-bist-temettu-25',
    ],
  },
  {
    id: 'teknik',
    title: 'Teknik analiz ve sinyaller',
    blurb: 'RSI, MACD, golden cross ve likidite okumaları.',
    slugs: [
      'rsi-indikatoru-alim-satim-sinyalleri',
      'macd-ve-rsi-kombinasyonu-ile-al-sat-stratejisi',
      'golden-cross-nedir',
      'order-block-ve-likidite-avciligi-nedir',
      'bist-isi-haritasi-nasil-okunur',
      'bist-alim-firsati-gunluk-tarama',
      'ucretsiz-ai-sinyal-nasil-kullanilir',
      'bist100-canli-nasil-takip-edilir',
    ],
  },
  {
    id: 'piyasa',
    title: 'Piyasa kuralları ve ürünler',
    blurb: 'BIST 30, VİOP, açığa satış, brüt takas, ETF ve kripto riski.',
    slugs: [
      'bist-30-hisseleri',
      'viop-nedir-nasil-islem-yapilir',
      'aciga-satis-nedir',
      'brut-takas-nedir',
      's-p-500-etf-fonlari-rehberi',
      'kripto-parada-stop-loss-koyma-stratejileri',
      'kripto-sinyal-radarinda-btc-eth',
    ],
  },
] as const;

export function groupPostsByTopic<T extends { slug: string }>(posts: T[]) {
  const used = new Set<string>();
  const groups = BLOG_TOPICS.map((topic) => {
    const items = (topic.slugs as readonly string[])
      .map((s) => posts.find((p) => p.slug === s))
      .filter((p): p is T => Boolean(p));
    items.forEach((p) => used.add(p.slug));
    return { ...topic, items };
  });
  const rest = posts.filter((p) => !used.has(p.slug));
  if (rest.length) groups[groups.length - 1].items.push(...rest);
  return groups.filter((g) => g.items.length);
}
