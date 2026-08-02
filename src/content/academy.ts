export type {
  BlogPost,
  ContentFaq,
  ContentLevel,
  ContentSection,
  EducationLesson,
  ToolCta,
} from '@/content/types';
export { EDUCATION_CATEGORIES } from '@/content/types';
import type { BlogPost, EducationLesson } from '@/content/types';
import { loadMdBlogPosts, loadMdLessons } from '@/lib/content/load-md';

const EDUCATION_LESSONS_STATIC: EducationLesson[] = [
  {
    category: 'borsa-temelleri',
    categoryTitle: 'Borsa & Hisse Temelleri',
    slug: 'borsa-nasil-oynanir',
    title: 'Borsa Nasıl Oynanır? Yeni Başlayanlar İçin Adım Adım Rehber',
    description:
      'Borsa İstanbul’da hisse almak, satmak ve risk yönetmek için adım adım başlangıç rehberi. Aracı kurum, emir tipleri ve Bullsye ile canlı takip.',
    keywords: [
      'borsa nasıl oynanır',
      'hisse senedi nasıl alınır',
      'BİST başlangıç',
      'borsa rehberi',
    ],
    level: 'baslangic',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-31',
    readingMinutes: 8,
    toolCta: {
      href: '/bist',
      label: 'BİST Canlı Fiyatları İncele',
      blurb:
        'Öğrendiğiniz hisseleri anlık fiyat, grafik ve analiz karnesiyle takip edin.',
    },
    sections: [
      {
        id: 'borsa-nedir',
        heading: 'Borsa nedir ve neden önemlidir?',
        paragraphs: [
          'Borsa, şirketlerin hisse senetlerinin alınıp satıldığı düzenlenmiş bir piyasadır. Türkiye’de en bilinen pazar Borsa İstanbul (BİST)tır. Yatırımcı, şirketin gelecekteki kârına ortak olur; fiyatlar arz-talep ile oluşur.',
          'Bullsye gibi bir terminal, soğuk fiyat listesini analiz karnesi, sinyal ve temettü takvimiyle birleştirerek karar sürecini hızlandırır.',
        ],
      },
      {
        id: 'adimlar',
        heading: 'Adım adım ilk işlem',
        paragraphs: [
          'Yeni başlayan bir yatırımcı şu sırayı izleyebilir: (1) aracı kurum / yatırım hesabı açmak, (2) risk profilini belirlemek, (3) izleme listesi kurmak, (4) küçük lotlarla öğrenmek, (5) emir ve maliyetleri anlamak.',
        ],
        bullets: [
          'Kimlik ve banka hesabıyla aracı kurumda hesap açın',
          'Önce BİST 30 gibi likit hisseleri izleyin',
          'Alarm ve watchlist ile disiplini otomatikleştirin',
          'Tek hisseye tüm sermayeyi bağlamayın',
        ],
      },
      {
        id: 'emir-tipleri',
        heading: 'Emir tipleri: piyasa, limit, stop',
        paragraphs: [
          'Piyasa emri anında gerçekleşir; limit emri sizin belirlediğiniz fiyattan bekler. Stop (zarar durdur) emri ise fiyat belirlenen seviyenin altına inince satışı tetikler. Risk yönetimi olmadan “borsa oynamak” kumar benzeri hale gelir.',
        ],
      },
      {
        id: 'bullsye-ile',
        heading: 'Bullsye ile canlı takip',
        paragraphs: [
          'Bullsye Overview ve BİST sayfalarında canlı fiyat, AI sinyal radarı ve analist hedeflerini yan yana görürsünüz. Eğitimde öğrendiğiniz kavramları hemen uygulamaya dökmek için ücretsiz terminal yeterlidir.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Borsa oynamak için ne kadar sermaye gerekir?',
        answer:
          'Yasal bir alt sınır yoktur; önemli olan kaybetmeyi göze alabileceğiniz tutarla başlamak ve çeşitlendirmektir.',
      },
      {
        question: 'Hisse almak için banka hesabı yeterli mi?',
        answer:
          'Hayır. SPK lisanslı bir aracı kurum veya bankanın yatırım hesabı üzerinden işlem yapılır.',
      },
    ],
  },
  {
    category: 'borsa-temelleri',
    categoryTitle: 'Borsa & Hisse Temelleri',
    slug: 'temettu-nedir-nasil-alinir',
    title: 'Temettü Nedir, Nasıl Alınır? BİST Temettü Rehberi',
    description:
      'Temettü nedir, ex-date nasıl işler, net temettü nasıl hesaplanır? En yüksek temettü verimli BİST hisselerini Bullsye Temettü Karnesi ile takip edin.',
    keywords: [
      'temettü nedir',
      'temettü nasıl alınır',
      'BİST temettü',
      'temettü verimi',
    ],
    level: 'baslangic',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-31',
    readingMinutes: 7,
    toolCta: {
      href: '/dividends',
      label: 'Temettü Karnesini Aç',
      blurb:
        'Canlı temettü verimi ve ex-date listesini tek ekranda görün.',
    },
    sections: [
      {
        id: 'tanim',
        heading: 'Temettü nedir?',
        paragraphs: [
          'Temettü, şirketin dağıtılabilir kârından pay sahiplerine nakit (veya bedelsiz hisse) olarak ödenen gelirdir. Pasif gelir arayan yatırımcılar için kritik bir metriktir.',
        ],
      },
      {
        id: 'ex-date',
        heading: 'Ex-date ve hak sahipliği',
        paragraphs: [
          'Temettü almak için ex-date (temettü sonrası işlem tarihi) öncesinde hisseyi portföyünüzde bulundurmanız gerekir. Ex-date günü hisse genelde temettü kadar “açığa” düşer; bu teknik bir fiyatlama etkisidir.',
        ],
      },
      {
        id: 'verim',
        heading: 'Temettü verimi nasıl okunur?',
        paragraphs: [
          'Temettü verimi = yıllık temettü / hisse fiyatı. Yüksek verim cazip görünse de sürdürülebilirlik (payout, nakit akışı) kontrol edilmelidir. Bullsye Temettü Karnesi canlı verim ve ex-date sunar.',
        ],
        bullets: [
          'Verim = temettü / fiyat',
          'Tek seferlik yüksek temettü yanıltıcı olabilir',
          'Portföy tahmini için hisse başı × adet kullanın',
        ],
      },
    ],
    faqs: [
      {
        question: 'Temettü vergisi var mı?',
        answer:
          'Türkiye’de temettü gelirleri belirli istisna ve stopaj kurallarına tabidir; güncel oranlar için mevzuatı ve müşavirinizi kontrol edin.',
      },
    ],
  },
  {
    category: 'borsa-temelleri',
    categoryTitle: 'Borsa & Hisse Temelleri',
    slug: 'fk-orani-nedir',
    title: 'F/K Oranı Nedir? Hisse Ucuz mu Pahalı mı?',
    description:
      'Fiyat/Kazanç (F/K) oranını okuyun, sektör karşılaştırması yapın ve Bullsye analiz karnesiyle iskontolu hisseleri bulun.',
    keywords: [
      'F/K oranı nedir',
      'fiyat kazanç oranı',
      'hisse ucuz mu',
      'değerleme',
    ],
    level: 'baslangic',
    publishedAt: '2026-07-03',
    updatedAt: '2026-07-31',
    readingMinutes: 6,
    toolCta: {
      href: '/compare',
      label: '1v1 F/K Kıyaslaması Yap',
      blurb: 'İki hisseyi F/K, PD/DD ve büyüme ile kafa kafaya karşılaştırın.',
    },
    sections: [
      {
        id: 'fk-tanim',
        heading: 'F/K nasıl hesaplanır?',
        paragraphs: [
          'F/K = Hisse fiyatı / Hisse başına kazanç (EPS). Yüksek F/K, piyasanın gelecekteki büyümeye prim verdiğini; düşük F/K ise iskonto veya zayıf beklenti sinyali olabilir.',
        ],
      },
      {
        id: 'karsilastirma',
        heading: 'Tek başına F/K yeterli mi?',
        paragraphs: [
          'Hayır. Aynı sektördeki emsallerle (peer) ve şirketin kendi tarihsel ortalamasıyla kıyaslayın. Bankacılık ile teknoloji F/K’ları doğası gereği farklıdır.',
        ],
      },
      {
        id: 'bullsye',
        heading: 'Bullsye’da değerleme',
        paragraphs: [
          'Hisse detay sayfalarındaki sağlık karnesi ve 1v1 compare motoru F/K ile PD/DD’yi canlı gösterir. Relative valuation widget’ı sektör iskontosunu özetler.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Düşük F/K her zaman alım fırsatı mıdır?',
        answer:
          'Değildir. Kazanç kalitesi düşüyorsa “değer tuzağı” olabilir. Büyüme, borçluluk ve nakit akışı birlikte okunmalıdır.',
      },
    ],
  },
  {
    category: 'teknik-analiz',
    categoryTitle: 'Teknik Analiz & AI Sinyalleri',
    slug: 'rsi-indikatoru-nedir',
    title: 'RSI İndikatörü Nedir? Aşırı Satım ve Alım Sinyalleri',
    description:
      'RSI (Relative Strength Index) 14 periyot nasıl okunur? 30 altı aşırı satım, 70 üstü aşırı alım. Bullsye AI Signal Radar ile canlı RSI kırılımları.',
    keywords: [
      'RSI indikatörü nedir',
      'aşırı satım',
      'aşırı alım',
      'RSI 14',
      'teknik analiz',
    ],
    level: 'orta',
    publishedAt: '2026-07-05',
    updatedAt: '2026-07-31',
    readingMinutes: 7,
    toolCta: {
      href: '/signals',
      label: 'AI Signal Radar’ı İncele',
      blurb:
        'BİST hisselerinin canlı RSI sinyallerini görmek için AI Signal Radar’ı inceleyin.',
    },
    sections: [
      {
        id: 'rsi-nedir',
        heading: 'RSI nedir?',
        paragraphs: [
          'RSI, fiyatın son N periyottaki yükseliş ve düşüş gücünü 0–100 skalasında ölçer. Klasik eşikler: 30 altı aşırı satım (potansiyel tepki alımı), 70 üstü aşırı alım (düzeltme riski).',
        ],
      },
      {
        id: 'okuma',
        heading: 'Nasıl okunur?',
        paragraphs: [
          'Tek başına RSI ile işlem açmak risklidir. Destek/direnç, hacim ve trend yönüyle birleştirin. Bullsye sinyalleri canlı fiyat + gün içi high/low bandından türetir; alarm motorunda RSI üstü/altı tetikleyiciler kurulabilir.',
        ],
        bullets: [
          'RSI < 30: tepki alımı ihtimali artar',
          'RSI > 70: kâr realizasyonu / kısa vadeli satış baskısı',
          'Divergence (fiyat yeni zirve, RSI düşüş) zayıflama işareti olabilir',
        ],
      },
      {
        id: 'uygulama',
        heading: 'Bullsye’da uygulama',
        paragraphs: [
          'AI Signal Radar ve /alerts sayfasında RSI kırılımlarını canlı izleyin. Eğitimdeki teoriyi hemen pratik terminale taşımak dönüşümün anahtarıdır.',
        ],
      },
    ],
    faqs: [
      {
        question: 'RSI 14 mü 21 mi kullanılmalı?',
        answer:
          'En yaygın ayar 14’tür. Daha uzun periyot sinyali yumuşatır; kısa periyot daha gürültülüdür.',
      },
    ],
  },
  {
    category: 'teknik-analiz',
    categoryTitle: 'Teknik Analiz & AI Sinyalleri',
    slug: 'golden-cross-nedir',
    title: 'Golden Cross (Altın Kesişim) Nedir?',
    description:
      'SMA 50 / SMA 200 Altın Kesişim yükseliş trendini nasıl gösterir? Bullsye teknik sinyalleriyle golden cross fırsatlarını yakalayın.',
    keywords: [
      'golden cross nedir',
      'altın kesişim',
      'SMA 50 200',
      'yükseliş trendi',
    ],
    level: 'orta',
    publishedAt: '2026-07-06',
    updatedAt: '2026-07-31',
    readingMinutes: 5,
    toolCta: {
      href: '/signals',
      label: 'Canlı Teknik Sinyalleri Gör',
      blurb: 'Momentum ve kırılım kartlarını AI Signal Radar’da takip edin.',
    },
    sections: [
      {
        id: 'tanim',
        heading: 'Golden Cross tanımı',
        paragraphs: [
          'Kısa vadeli hareketli ortalama (ör. SMA 50), uzun vadeli ortalamayı (ör. SMA 200) yukarı kesince Altın Kesişim oluşur. Tarihsel olarak orta-uzun vadeli boğa eğilimini işaret eder.',
        ],
      },
      {
        id: 'risk',
        heading: 'Yanlış sinyaller',
        paragraphs: [
          'Yatay piyasalarda sık kesişim (whipsaw) görülebilir. Hacim teyidi ve makro risk iştahı olmadan tek başına alım kararı vermeyin.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Death Cross nedir?',
        answer:
          'Kısa ortalamanın uzun ortalamayı aşağı kesmesidir; zayıflama / ayı eğilimi yorumlanır.',
      },
    ],
  },
  {
    category: 'teknik-analiz',
    categoryTitle: 'Teknik Analiz & AI Sinyalleri',
    slug: 'destek-ve-direnc-nasil-cizilir',
    title: 'Destek ve Direnç Seviyeleri Nasıl Çizilir?',
    description:
      'Destek ve direnç nedir, nasıl çizilir? Gün içi high/low bandı ve Bullsye grafik araçlarıyla pratik rehber.',
    keywords: [
      'destek direnç nedir',
      'destek nasıl çizilir',
      'teknik analiz destek',
    ],
    level: 'orta',
    publishedAt: '2026-07-07',
    updatedAt: '2026-07-31',
    readingMinutes: 6,
    toolCta: {
      href: '/bist/THYAO',
      label: 'Örnek Hisse Grafiğini Aç',
      blurb: 'THYAO canlı grafik üzerinde seviye okumayı pratik edin.',
    },
    sections: [
      {
        id: 'tanim',
        heading: 'Destek ve direnç nedir?',
        paragraphs: [
          'Destek, alıcıların fiyatı tutma eğiliminde olduğu bölgedir; direnç satıcıların baskın olduğu bölgedir. Kırılım sonrası roller tersine dönebilir.',
        ],
      },
      {
        id: 'yontem',
        heading: 'Pratik çizim yöntemi',
        paragraphs: [
          'Önceki swing high/low noktalarını birleştirin. Tek piksel çizgi yerine “bölge” düşünün. Bullsye sinyal motoru gün içi dip/zirve bandını canlı fırsat skoruna yansıtır.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Destek kırılırsa ne olur?',
        answer:
          'Kırılan destek çoğu zaman yeni direnç olur. Stop-loss bu senaryo için önceden planlanmalıdır.',
      },
    ],
  },
  {
    category: 'kripto-risk',
    categoryTitle: 'Kripto & Risk Yönetimi',
    slug: 'kripto-stop-loss-nereye-konur',
    title: 'Kripto Risk Yönetimi: Stop-Loss Nereye Konur?',
    description:
      'Kripto parada stop-loss nasıl yerleştirilir? Volatiliteye göre yüzde ve ATR yaklaşımı. Bullsye AI sinyallerindeki SL/TP hesapları.',
    keywords: [
      'stop loss nedir',
      'kripto risk yönetimi',
      'zarar durdur',
      'BTC stop loss',
    ],
    level: 'ileri',
    publishedAt: '2026-07-08',
    updatedAt: '2026-07-31',
    readingMinutes: 7,
    toolCta: {
      href: '/crypto',
      label: 'Kripto Radarını Aç',
      blurb: 'BTC/ETH canlı fiyat, derinlik ve sinyal kartlarını izleyin.',
    },
    sections: [
      {
        id: 'neden',
        heading: 'Neden stop-loss şart?',
        paragraphs: [
          'Kripto 7/24 işlem görür ve ani likidasyonlar sık görülür. Stop-loss, duygusal kararları engeller ve sermayeyi korur.',
        ],
      },
      {
        id: 'yerlestirme',
        heading: 'Nereye konur?',
        paragraphs: [
          'Yaygın yöntemler: son swing low’un biraz altı, sabit yüzde (ör. %2–4), veya ATR çarpanı. Bullsye sinyal kartlarında SL/TP canlı giriş fiyatından matematiksel yüzde ile üretilir.',
        ],
        bullets: [
          'Risk başına sermayenin %0.5–1’ini aşmayın',
          'Kaldıraçlı işlemde stop mesafesini küçültün',
          'Alarm motoruyla fiyat altı bildirimi kurun',
        ],
      },
    ],
    faqs: [
      {
        question: 'Trailing stop nedir?',
        answer:
          'Fiyat yükseldikçe stop seviyesinin yukarı çekilmesidir; kârı kilitlemeye yardımcı olur.',
      },
    ],
  },
  {
    category: 'kripto-risk',
    categoryTitle: 'Kripto & Risk Yönetimi',
    slug: 'balina-hareketleri-nasil-takip-edilir',
    title: 'Balina Hareketleri (Smart Money) Nasıl Takip Edilir?',
    description:
      'Smart money ve balina hareketleri nedir? Hacim × momentum ile Bullsye Smart Money ekranında canlı takip.',
    keywords: [
      'balina hareketleri',
      'smart money nedir',
      'kripto balina',
      'kurumsal alım',
    ],
    level: 'ileri',
    publishedAt: '2026-07-09',
    updatedAt: '2026-07-31',
    readingMinutes: 6,
    toolCta: {
      href: '/smart-money',
      label: 'Smart Money Ekranını Aç',
      blurb:
        'Canlı hacim × momentum liderlerini BİST ve kripto için tek listede görün.',
    },
    sections: [
      {
        id: 'tanim',
        heading: 'Smart money nedir?',
        paragraphs: [
          'Smart money, büyük sermayeli yatırımcıların pozisyon değişimlerini ifade eder. Zincir üstü “balina” cüzdanları veya borsada yüksek hacimli kurumsal akışlar buna örnektir.',
        ],
      },
      {
        id: 'bullsye',
        heading: 'Bullsye yaklaşımı',
        paragraphs: [
          'Bullsye Smart Money sayfası canlı hacim ve fiyat değişimini birleştirerek likidite liderlerini gösterir.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Balina alımı her zaman yükseliş midir?',
        answer:
          'Hayır. Dağıtım (satış) da büyük cüzdanlardan gelir. Hacmi fiyat yönü ve bağlamla birlikte okuyun.',
      },
    ],
  },
];

function mergeBySlug<T extends { slug: string }>(base: T[], extra: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of base) map.set(item.slug, item);
  for (const item of extra) map.set(item.slug, item);
  return [...map.values()];
}

export const EDUCATION_LESSONS: EducationLesson[] = mergeBySlug(
  EDUCATION_LESSONS_STATIC,
  loadMdLessons()
);

const BLOG_POSTS_STATIC: BlogPost[] = [
  {
    slug: 'bist-canli-analiz-nasil-yapilir',
    title: 'BİST Canlı Analiz Nasıl Yapılır? Terminal Checklist',
    description:
      'Borsa İstanbul canlı analiz checklist’i: fiyat, F/K, analist hedefi, RSI ve temettü. Bullsye ile uçtan uca akış.',
    keywords: [
      'BİST canlı analiz',
      'hisse analizi nasıl yapılır',
      'borsa terminali',
    ],
    publishedAt: '2026-07-20',
    updatedAt: '2026-07-31',
    readingMinutes: 5,
    tags: ['BİST', 'Analiz', 'Terminal'],
    toolCta: {
      href: '/?lang=tr',
      label: 'Overview Terminaline Git',
      blurb: 'AI günlük vizyon, fırsat radarı ve hissiyat metresini açın.',
    },
    sections: [
      {
        id: 'checklist',
        heading: '5 dakikalık canlı analiz checklist’i',
        paragraphs: [
          'Profesyonel bir akış: (1) endeks yönü, (2) hisse fiyat + değişim, (3) F/K ve sağlık skoru, (4) analist hedef prim, (5) teknik sinyal / alarm.',
        ],
        bullets: [
          'Overview’da AI Günlük Vizyon’u okuyun',
          'Hisse detayında konsensüs hedefini kontrol edin',
          'Sinyal Radar’da aşırı satım/alım var mı bakın',
        ],
      },
      {
        id: 'hata',
        heading: 'Yaygın hatalar',
        paragraphs: [
          'Tek indikatöre körü körüne güvenmek, temettüyü unutmak ve stop-loss koymamak en sık görülen hatalardır. Eğitim Hub’ındaki derslerle temeli sağlamlaştırın.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Bullsye ücretsiz mi?',
        answer:
          'Temel canlı takip ve birçok analiz aracı ücretsizdir; bazı kurum detayları kayıt ile açılır.',
      },
    ],
  },
  {
    slug: 'analist-hedef-fiyati-nasil-okunur',
    title: 'Analist Hedef Fiyatı Nasıl Okunur? Potansiyel Prim Rehberi',
    description:
      'Ortalama, yüksek/düşük hedef ve upside % nasıl yorumlanır? Bullsye Hedef Fiyatlar’da canlı konsensüsü okuyun.',
    keywords: [
      'analist hedef fiyat',
      'hedef fiyat nedir',
      'potansiyel prim',
    ],
    publishedAt: '2026-07-22',
    updatedAt: '2026-07-31',
    readingMinutes: 5,
    tags: ['Analist', 'Hedef Fiyat', 'SEO'],
    toolCta: {
      href: '/targets',
      label: 'Hedef Fiyatlar Terminali',
      blurb: 'Canlı konsensüs hedeflerini filtreleyip sıralayın.',
    },
    sections: [
      {
        id: 'mean',
        heading: 'Ortalama hedef',
        paragraphs: [
          'Analistlerin 12 aylık fiyat tahminlerinin ortalamasıdır. Mevcut fiyata göre yüzde fark “potansiyel prim” olarak okunur; garanti değildir.',
        ],
      },
      {
        id: 'dagilim',
        heading: 'Al / Tut / Sat dağılımı',
        paragraphs: [
          'Sadece ortalama değil, oy dağılımı da önemlidir. Hepsi “Al” diyorsa konsensüs güçlü; karışık dağılımda volatilite bekleyin.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Hedef fiyat her zaman tutar mı?',
        answer:
          'Hayır. Makro şoklar ve şirket haberleri hedefleri geçersiz kılabilir. Risk yönetimi şarttır.',
      },
    ],
  },
  {
    slug: 'kripto-sinyal-radarinda-btc-eth',
    title: 'Kripto Sinyal Radarında BTC ve ETH Nasıl İzlenir?',
    description:
      'Bitcoin ve Ethereum için canlı sinyal, 24s high/low ve risk yönetimi. Bullsye kripto radarı rehberi.',
    keywords: [
      'Bitcoin sinyal',
      'ETH analiz',
      'kripto radar',
      'BTC canlı',
    ],
    publishedAt: '2026-07-25',
    updatedAt: '2026-07-31',
    readingMinutes: 4,
    tags: ['Kripto', 'BTC', 'Sinyal'],
    toolCta: {
      href: '/crypto/BTCUSDT',
      label: 'BTC Canlı Sayfası',
      blurb: 'Fiyat, emir defteri ve teknik bant karnesini açın.',
    },
    sections: [
      {
        id: 'izleme',
        heading: 'BTC/ETH izleme rutini',
        paragraphs: [
          '24 saatlik değişim, hacim liderliği ve AI sinyal kartlarını birlikte okuyun. Kaldıraç kullanıyorsanız stop mesafesini daraltın.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Kripto 7/24 mü?',
        answer:
          'Evet. Bu yüzden fiyat alarmı ve bildirim izni kritiktir.',
      },
    ],
  },
];

export const BLOG_POSTS: BlogPost[] = mergeBySlug(
  BLOG_POSTS_STATIC,
  loadMdBlogPosts()
);

export function getLesson(category: string, slug: string) {
  return EDUCATION_LESSONS.find(
    (l) => l.category === category && l.slug === slug
  );
}

export function getLessonsByCategory(category: string) {
  return EDUCATION_LESSONS.filter((l) => l.category === category);
}

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function estimateTitle(title: string, max = 60) {
  return title.length <= max ? title : `${title.slice(0, max - 1)}…`;
}

export function estimateDescription(desc: string, max = 155) {
  return desc.length <= max ? desc : `${desc.slice(0, max - 1)}…`;
}
