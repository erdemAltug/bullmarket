import type { RankingConfig } from '@/components/seo/ScoreRankingPage';

const RELATED = [
  { href: '/bist/en-yuksek-skorlu-hisseler', label: 'En yüksek skorlu BİST hisseleri' },
  { href: '/bist/en-cok-yukselen-hisseler', label: 'Bugün en çok yükselen hisseler' },
  { href: '/bist/en-cok-dusen-hisseler', label: 'Bugün en çok düşen hisseler' },
  { href: '/nasdaq/en-yuksek-skorlu-hisseler', label: 'En yüksek skorlu ABD hisseleri' },
  { href: '/kripto/en-yuksek-skorlu-coinler', label: 'En yüksek skorlu coinler' },
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
  },
  cryptoTop: {
    path: '/kripto/en-yuksek-skorlu-coinler',
    category: 'CRYPTO',
    sort: 'score',
    h1: 'Bugün en yüksek analiz skoruna sahip kripto paralar',
    title: 'En Yüksek Skorlu Coinler Bugün: Kripto Canlı Liste',
    description:
      'Bugün analiz skoru en yüksek 50 kripto para: fiyat, 24 saatlik değişim ve 0–100 skor. Binance verisiyle her 15 dakikada güncellenir.',
    intro:
      'Binance’te işlem hacmi yüksek 200 civarı coini her 15 dakikada tarıyor ve analiz skoruna göre sıralıyoruz. Kripto piyasası 7/24 açık ve oynaktır; liste hızla değişebilir.',
    notes: [
      SCORE_NOTE,
      {
        heading: 'Kriptoda risk',
        body: 'Kripto paralar hisselere göre çok daha oynaktır. Kaldıraçlı işlemlerden kaçının, her pozisyon için zarar kes seviyesi belirleyin ve önemli seviyelere fiyat alarmı kurun.',
      },
    ],
    related: related('/kripto/en-yuksek-skorlu-coinler'),
  },
} satisfies Record<string, RankingConfig>;
