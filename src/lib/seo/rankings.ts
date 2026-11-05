import type { RankingConfig } from '@/components/seo/ScoreRankingPage';
import { BIST_SECTORS, US_SECTORS, type SectorDef } from '@/lib/seo/sectors';

export const YEAR = 2026;

const FAQ_SCORE = {
  q: 'Analiz skoru nasıl hesaplanıyor?',
  a: 'Skor; günlük fiyat hareketi, fiyatın gün içi aralıktaki konumu, işlem hacmi ve F/K oranından 0–100 arasında hesaplanır. Yöntemin tamamı metodoloji sayfamızda açıkça anlatılır.',
};
const FAQ_ADVICE = {
  q: 'Bu liste alım tavsiyesi mi?',
  a: 'Hayır. Liste, o gün öne çıkan hisseleri gösteren bir bilgi aracıdır; SPK düzenlemeleri kapsamında yatırım tavsiyesi değildir. Karar vermeden önce şirketin bilançosunu, analist hedef fiyatlarını ve kendi risk durumunu değerlendir.',
};
const FAQ_FRESH = {
  q: 'Liste ne sıklıkla güncelleniyor?',
  a: 'Sunucumuz piyasayı yaklaşık 15 dakikada bir tarar ve liste bu taramayla yenilenir. Fiyatlar veri sağlayıcıya bağlı olarak gecikmeli olabilir.',
};

const RELATED = [
  { href: '/bist/en-yuksek-skorlu-hisseler', label: 'En yüksek skorlu BİST hisseleri' },
  { href: '/bist/en-cok-yukselen-hisseler', label: 'Bugün en çok yükselen hisseler' },
  { href: '/bist/en-cok-dusen-hisseler', label: 'Bugün en çok düşen hisseler' },
  { href: '/nasdaq/en-yuksek-skorlu-hisseler', label: 'En yüksek skorlu ABD hisseleri' },
  { href: '/kripto/en-yuksek-skorlu-coinler', label: 'En yüksek skorlu coinler' },
  { href: '/bist/sektorler', label: 'Sektörlere göre BİST' },
  { href: `/bist/${YEAR}-one-cikan-hisseler`, label: `${YEAR}'de öne çıkan BİST hisseleri` },
  { href: `/nasdaq/${YEAR}-one-cikan-abd-hisseleri`, label: `${YEAR}'de öne çıkan ABD hisseleri` },
  { href: '/targets', label: 'Analist hedef fiyatları' },
];

const related = (self: string) => RELATED.filter((r) => r.href !== self);

const SCORE_NOTE = {
  heading: 'Analiz skoru ne anlatır?',
  body: 'Bullsye analiz skoru; günlük fiyat hareketi, gün içi bant konumu, işlem hacmi ve değerleme (F/K) verilerini 0–100 arasında tek bir sayıya indirir. Yüksek skor, o gün öne çıkan güçlü bir görünüme işaret eder; tek başına alım gerekçesi değildir. Hissenin sayfasında skorun geçmişini, analist hedef fiyatlarını ve bilançosunu birlikte inceleyin.',
};

export const RANKINGS = {
  bistTop: {
    path: '/bist/en-yuksek-skorlu-hisseler',
    category: 'BIST',
    sort: 'score',
    h1: 'Bugün en yüksek analiz skoruna sahip BİST hisseleri',
    title: 'En Yüksek Skorlu BİST Hisseleri Bugün: Canlı Liste',
    description:
      'Borsa İstanbul’da bugün analiz skoru en yüksek 50 hisse: momentum, hacim ve değerlemeden hesaplanan 0–100 skor, fiyat ve günlük değişim. Her 15 dakikada güncellenir.',
    intro:
      'Borsa İstanbul’daki 500’den fazla hisseyi her 15 dakikada tarıyor ve analiz skoruna göre sıralıyoruz. Aşağıda bugün en yüksek skoru alan 50 hisse var. Bir hisseye tıklayarak hedef fiyatını, skor geçmişini ve grafiğini görebilirsin.',
    notes: [
      SCORE_NOTE,
      {
        heading: 'Bu listeyi nasıl kullanmalı?',
        body: 'Liste, o gün nereye bakman gerektiğini hızlıca gösteren bir başlangıç noktasıdır. İlgini çeken hisseyi izleme listene ekle, önemli seviyeler için fiyat alarmı kur ve kararını şirketin temel verileriyle birlikte ver.',
      },
    ],
    related: related('/bist/en-yuksek-skorlu-hisseler'),
    faqs: [
      { q: 'Bugün hangi BİST hisselerinin skoru en yüksek?', a: 'Tablodaki ilk sıralar, son taramada en yüksek analiz skorunu alan Borsa İstanbul hisseleridir. Liste gün içinde fiyat ve hacim değiştikçe güncellenir.' },
      FAQ_SCORE,
      FAQ_ADVICE,
      FAQ_FRESH,
    ],
  },
  bistGainers: {
    path: '/bist/en-cok-yukselen-hisseler',
    category: 'BIST',
    sort: 'gainers',
    h1: 'Bugün en çok yükselen BİST hisseleri',
    title: 'Bugün En Çok Yükselen Hisseler: BİST Canlı Liste',
    description:
      'Borsa İstanbul’da bugün en çok yükselen 50 hisse: yüzde değişim, fiyat ve analiz skoru. Tavan yapan ve öne çıkan hisseler her 15 dakikada güncellenir.',
    intro:
      'Borsa İstanbul’da bugün yüzde olarak en çok değer kazanan 50 hisse. Yanındaki analiz skoru, yükselişin hacim ve değerleme ile desteklenip desteklenmediğini hızlıca görmeni sağlar.',
    notes: [
      {
        heading: 'Hisse neden yükselir?',
        body: 'Güçlü bir KAP açıklaması, beklentinin üstünde bilanço, sektörü etkileyen bir gelişme ya da genel piyasa yükselişi hisseleri yukarı taşır. Sert yükselişlerden sonra kâr satışları gelebilir; tavan serileri her zaman devam etmez.',
      },
      SCORE_NOTE,
    ],
    related: related('/bist/en-cok-yukselen-hisseler'),
    faqs: [
      { q: 'Bugün tavan yapan hisseler hangileri?', a: 'Borsa İstanbul’da paylar için günlük fiyat limiti genellikle yüzde 10’dur. Tabloda yüzde 10’a yakın yükselen hisseler o gün tavan bölgesindedir.' },
      { q: 'En çok yükselen hisseyi almak mantıklı mı?', a: 'Sert yükselişlerden sonra kâr satışları gelebilir ve tavan serileri her zaman devam etmez. Yükselişin sebebini (KAP açıklaması, bilanço, sektör haberi) anlamadan karar vermemek gerekir.' },
      FAQ_ADVICE,
      FAQ_FRESH,
    ],
  },
  bistLosers: {
    path: '/bist/en-cok-dusen-hisseler',
    category: 'BIST',
    sort: 'losers',
    h1: 'Bugün en çok düşen BİST hisseleri',
    title: 'Bugün En Çok Düşen Hisseler: BİST Canlı Liste',
    description:
      'Borsa İstanbul’da bugün en çok düşen 50 hisse: yüzde değişim, fiyat ve analiz skoru. Düşüşün sebebini anlamak için hisse sayfalarına geçin.',
    intro:
      'Borsa İstanbul’da bugün yüzde olarak en çok değer kaybeden 50 hisse. Düşüşün sebebini anlamak için hissenin sayfasındaki haber başlıklarına ve skor geçmişine bak.',
    notes: [
      {
        heading: 'Hisse neden düşer?',
        body: 'Olumsuz bir şirket haberi, beklentinin altında bilanço, faiz ve kur hareketleri, genel piyasa satışı ya da kâr realizasyonu fiyatı aşağı çekebilir. Düşüş tek başına fırsat ya da tehlike değildir; önce sebebini anlamak gerekir.',
      },
      SCORE_NOTE,
    ],
    related: related('/bist/en-cok-dusen-hisseler'),
    faqs: [
      { q: 'Bugün taban yapan hisseler hangileri?', a: 'Borsa İstanbul’da paylar için günlük fiyat limiti genellikle yüzde 10’dur. Tabloda yüzde 10’a yakın düşen hisseler o gün taban bölgesindedir.' },
      { q: 'Düşen hisse alınır mı?', a: 'Düşüşün sebebi önemlidir. Genel piyasa satışıyla düşen sağlam bir şirket ile kötü bir haberle düşen şirket farklıdır. Hisse sayfasındaki haber başlıklarına ve skor geçmişine bak.' },
      FAQ_ADVICE,
      FAQ_FRESH,
    ],
  },
  usTop: {
    path: '/nasdaq/en-yuksek-skorlu-hisseler',
    category: 'US',
    sort: 'score',
    h1: 'Bugün en yüksek analiz skoruna sahip ABD hisseleri',
    title: 'En Yüksek Skorlu ABD Hisseleri Bugün: NASDAQ ve NYSE',
    description:
      'NASDAQ ve NYSE’de bugün analiz skoru en yüksek 50 hisse: Türkçe, canlı fiyat, günlük değişim ve 0–100 skor. Her 15 dakikada güncellenir.',
    intro:
      'ABD borsalarında takip ettiğimiz 250’den fazla hisseyi her 15 dakikada tarıyor ve analiz skoruna göre sıralıyoruz. Hisseye tıklayarak Türkçe analiz sayfasına, analist hedef fiyatına ve skor geçmişine ulaşabilirsin.',
    notes: [SCORE_NOTE],
    related: related('/nasdaq/en-yuksek-skorlu-hisseler'),
    faqs: [
      { q: 'Türkiye’den ABD hissesi nasıl alınır?', a: 'Aracı kurumların yurt dışı işlem hesapları, TEFAS’taki yabancı hisse fonları veya ETF’ler ile. Adım adım anlatım eğitim bölümümüzde.' },
      FAQ_SCORE,
      FAQ_ADVICE,
      FAQ_FRESH,
    ],
  },
  cryptoTop: {
    path: '/kripto/en-yuksek-skorlu-coinler',
    category: 'CRYPTO',
    sort: 'score',
    h1: 'Bugün en yüksek analiz skoruna sahip kripto paralar',
    title: 'En Yüksek Skorlu Coinler Bugün: Kripto Canlı Liste',
    description:
      'Bugün analiz skoru en yüksek 50 kripto para: fiyat, 24 saatlik değişim ve 0–100 skor. Her 15 dakikada güncellenir.',
    intro:
      'İşlem hacmi yüksek 200 civarı coini her 15 dakikada tarıyor ve analiz skoruna göre sıralıyoruz. Kripto piyasası 7/24 açık ve oynaktır; liste hızla değişebilir.',
    notes: [
      SCORE_NOTE,
      {
        heading: 'Kriptoda risk',
        body: 'Kripto paralar hisselere göre çok daha oynaktır. Kaldıraçlı işlemlerden kaçının, her pozisyon için zarar kes seviyesi belirleyin ve önemli seviyelere fiyat alarmı kurun.',
      },
    ],
    related: related('/kripto/en-yuksek-skorlu-coinler'),
    faqs: [
      { q: 'Bugün hangi coinler öne çıkıyor?', a: 'Tablodaki ilk sıralar, son taramada en yüksek analiz skorunu alan coinlerdir. Kripto piyasası 7/24 açık olduğu için liste gece de güncellenir.' },
      FAQ_SCORE,
      FAQ_ADVICE,
      FAQ_FRESH,
    ],
  },
} satisfies Record<string, RankingConfig>;

/* ---------- Sector lists ---------- */

function cap(s: string) {
  return s.charAt(0).toLocaleUpperCase('tr-TR') + s.slice(1);
}

/** "banka hisseleri" -> "Banka Hisseleri" for <title>; keeps "ABD", "GYO". */
function titleCase(s: string) {
  return s
    .split(' ')
    .map((w) => (w === w.toUpperCase() ? w : cap(w)))
    .join(' ');
}

export function bistSectorConfig(def: SectorDef): RankingConfig {
  return {
    path: `/bist/sektor/${def.slug}`,
    category: 'BIST',
    sort: 'score',
    symbols: def.symbols,
    h1: `En yüksek skorlu ${def.noun} (BİST)`,
    title: `En Yüksek Skorlu ${titleCase(def.noun)} ${YEAR}: BİST Canlı Liste`,
    description: `Borsa İstanbul ${def.noun} canlı listesi: analiz skoru, fiyat ve günlük değişim. Sektörde bugün öne çıkan hisseler her 15 dakikada güncellenir.`,
    intro: `Borsa İstanbul’daki ${def.noun} analiz skoruna göre sıralandı. ${def.blurb}`,
    ogSubtitle: `${def.name} sektörü · canlı skor sıralaması`,
    notes: [SCORE_NOTE],
    related: [
      ...BIST_SECTORS.filter((x) => x.slug !== def.slug)
        .slice(0, 6)
        .map((x) => ({ href: `/bist/sektor/${x.slug}`, label: x.noun })),
      { href: '/bist/sektorler', label: 'Tüm sektörler' },
      { href: '/bist/en-yuksek-skorlu-hisseler', label: 'En yüksek skorlu BİST hisseleri' },
    ],
    faqs: [
      { q: `Bugün en yüksek skorlu ${def.noun} hangileri?`, a: `Tablonun ilk sıraları, son taramada en yüksek analiz skorunu alan ${def.noun}. Liste fiyat ve hacim değiştikçe gün içinde güncellenir.` },
      { q: `${cap(def.noun)} nasıl değerlendirilir?`, a: def.blurb },
      FAQ_ADVICE,
      FAQ_FRESH,
    ],
  };
}

export function usSectorConfig(def: SectorDef): RankingConfig {
  return {
    path: `/nasdaq/sektor/${def.slug}`,
    category: 'US',
    sort: 'score',
    symbols: def.symbols,
    h1: `En yüksek skorlu ${def.noun}`,
    title: `En Yüksek Skorlu ${titleCase(def.noun)} ${YEAR}: Türkçe Canlı Liste`,
    description: `${cap(def.noun)} canlı listesi: analiz skoru, fiyat ve günlük değişim. ABD borsalarında sektörde öne çıkan hisseler Türkçe, her 15 dakikada güncellenir.`,
    intro: `ABD borsalarındaki ${def.noun} analiz skoruna göre sıralandı. ${def.blurb}`,
    ogSubtitle: `${def.name} · canlı skor sıralaması`,
    notes: [SCORE_NOTE],
    related: [
      ...US_SECTORS.filter((x) => x.slug !== def.slug).map((x) => ({ href: `/nasdaq/sektor/${x.slug}`, label: x.noun })),
      { href: '/nasdaq/en-yuksek-skorlu-hisseler', label: 'En yüksek skorlu ABD hisseleri' },
      { href: '/egitim/yatirim-araclari/abd-hisse-senedi-nasil-alinir', label: 'ABD hissesi nasıl alınır?' },
    ],
    faqs: [
      { q: `Bugün en yüksek skorlu ${def.noun} hangileri?`, a: `Tablonun ilk sıraları, son taramada en yüksek analiz skorunu alan ${def.noun}.` },
      { q: 'Türkiye’den bu hisseler nasıl alınır?', a: 'Aracı kurumların yurt dışı işlem hesapları, TEFAS’taki yabancı hisse fonları veya ETF’ler ile alınabilir.' },
      FAQ_ADVICE,
      FAQ_FRESH,
    ],
  };
}

/* ---------- Yearly editorial pages ---------- */

export const YEARLY = {
  bist: {
    path: `/bist/${YEAR}-one-cikan-hisseler`,
    category: 'BIST',
    sort: 'score',
    limit: 25,
    h1: `${YEAR}’de öne çıkan BİST hisseleri`,
    title: `${YEAR}’de Öne Çıkan BİST Hisseleri: Skor ve Sektör Liderleri`,
    description: `${YEAR} yılında Borsa İstanbul’da öne çıkan hisseler: canlı skor liderleri, her sektörün en güçlü hissesi ve izlenecek konular. Her gün güncellenir.`,
    intro: `${YEAR}’de Borsa İstanbul’da hangi hisselere bakmalı? Bu sayfa her gün güncellenen verilerle bu soruya bir başlangıç noktası sunar: önce tüm piyasanın skor liderleri, ardından her sektörün en güçlü hissesi. Listeler bir tavsiye değil, araştırmana nereden başlayacağını gösteren bir haritadır.`,
    ogSubtitle: 'Skor liderleri ve sektör liderleri, her gün güncel',
    notes: [
      {
        heading: `${YEAR}’de BİST’te izlenecek konular`,
        body: 'Faiz indirim takvimi bankacılık ve gayrimenkul hisselerini, enflasyonun seyri perakende ve gıda şirketlerini, kur ve küresel talep ise ihracatçı sanayi şirketlerini doğrudan etkiliyor. Savunma ve enerji tarafında sipariş ve yatırım haberleri, temettü döneminde ise yüksek temettü veren şirketler öne çıkıyor.',
      },
      SCORE_NOTE,
    ],
    related: [
      { href: '/bist/sektorler', label: 'Sektörlere göre BİST' },
      { href: '/bist/yuksek-temettu-verenler-2026', label: `${YEAR} yüksek temettü verenler` },
      { href: '/targets', label: 'Analist hedef fiyatları' },
      { href: '/bist/halka-arz-takvimi', label: 'Halka arz takvimi' },
      { href: '/bist/en-cok-yukselen-hisseler', label: 'Bugün en çok yükselenler' },
    ],
    faqs: [
      { q: `${YEAR}’de hangi BİST hisseleri öne çıkıyor?`, a: 'Bu sayfadaki liste, son taramada en yüksek analiz skorunu alan hisseleri ve her sektörün lideri olan hisseyi gösterir. Liste her gün değişir; tek bir günün sıralaması uzun vadeli bir yargı değildir.' },
      { q: 'Uzun vadeli yatırım için hisse nasıl seçilir?', a: 'Uzun vadede şirketin kârlılığı, büyümesi, borç yapısı ve temettü politikası belirleyicidir. Skor kısa vadeli görünümü özetler; uzun vadeli kararlar için bilanço ve analist hedef fiyatlarını incelemek gerekir.' },
      FAQ_ADVICE,
      FAQ_SCORE,
    ],
  },
  us: {
    path: `/nasdaq/${YEAR}-one-cikan-abd-hisseleri`,
    category: 'US',
    sort: 'score',
    limit: 25,
    h1: `${YEAR}’de öne çıkan ABD hisseleri`,
    title: `${YEAR}’de Öne Çıkan ABD Hisseleri: NASDAQ Skor Liderleri`,
    description: `${YEAR} yılında NASDAQ ve NYSE’de öne çıkan hisseler: canlı skor liderleri ve sektör liderleri, Türkçe ve her gün güncel.`,
    intro: `${YEAR}’de ABD borsalarında hangi hisselere bakmalı? Önce takip ettiğimiz 250’den fazla ABD hissesinin skor liderleri, ardından teknoloji, yarı iletken, banka, enerji ve sağlık sektörlerinin en güçlü hissesi.`,
    ogSubtitle: 'NASDAQ ve NYSE skor liderleri, her gün güncel',
    notes: [
      {
        heading: `${YEAR}’de ABD borsasında izlenecek konular`,
        body: 'Yapay zeka yatırımları yarı iletken ve büyük teknoloji şirketlerini, Fed’in faiz kararları bankaları ve büyüme hisselerini, petrol fiyatları ise enerji şirketlerini yönlendiriyor. Türkiye’den yatırım yapanlar için dolar/TL kuru da getiriyi doğrudan etkiliyor.',
      },
      SCORE_NOTE,
    ],
    related: [
      ...US_SECTORS.map((x) => ({ href: `/nasdaq/sektor/${x.slug}`, label: x.noun })),
      { href: '/egitim/yatirim-araclari/abd-hisse-senedi-nasil-alinir', label: 'ABD hissesi nasıl alınır?' },
    ],
    faqs: [
      { q: `${YEAR}’de hangi ABD hisseleri öne çıkıyor?`, a: 'Bu sayfadaki liste, son taramada en yüksek analiz skorunu alan ABD hisselerini ve her sektörün liderini gösterir. Liste her gün değişir.' },
      { q: 'Türkiye’den NASDAQ hissesi nasıl alınır?', a: 'Aracı kurumların yurt dışı işlem hesapları, TEFAS’taki yabancı hisse fonları veya ETF’ler ile. Adım adım anlatım eğitim bölümümüzde.' },
      FAQ_ADVICE,
      FAQ_SCORE,
    ],
  },
} satisfies Record<string, RankingConfig>;
