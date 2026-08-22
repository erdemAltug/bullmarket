import Link from 'next/link';

export type HubSeoLink = { href: string; label: string };

export type HubSeoContent = {
  heading: string;
  paragraphs: string[];
  links: HubSeoLink[];
  faqs: { question: string; answer: string }[];
};

export function HubSeoBlock({ content }: { content: HubSeoContent }) {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <section className="mt-10 space-y-6 border-t border-zinc-800 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <div className="max-w-3xl space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
          {content.heading}
        </h2>
        {content.paragraphs.map((p) => (
          <p key={p.slice(0, 40)} className="text-sm leading-relaxed text-zinc-400">
            {p}
          </p>
        ))}
      </div>

      <nav aria-label="İlgili sayfalar" className="flex flex-wrap gap-2">
        {content.links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {content.faqs.length ? (
        <div className="max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
          <h3 className="text-sm font-semibold text-zinc-100">Sıkça sorulanlar</h3>
          <dl className="mt-3 space-y-3">
            {content.faqs.map((f) => (
              <div key={f.question}>
                <dt className="text-sm font-medium text-zinc-200">{f.question}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-zinc-400">
                  {f.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}

export const BIST_HUB_SEO: HubSeoContent = {
  heading: 'BİST canlı fiyat ve analiz — nasıl kullanılır?',
  paragraphs: [
    'Borsa İstanbul tarama tablosunda hisseleri filtreleyin, grafik panelinden kısa vadeli yapıyı okuyun. Canlı fiyat; sinyal, fırsat skoru ve eğitim ile aynı terminaldedir. Kaynak BİST sayfasıdır; fırsat skoru /firsatlar, kurum hedefi /targets.',
    'Yeni başlıyorsanız Eğitim Hub’daki borsa dersini, günlük ritim için Blog’daki 10 dakikalık rutini okuyun; ardından Fırsat Masası’nda skor kartlarına geçin.',
  ],
  links: [
    { href: '/bist/heatmap', label: 'Isı haritası' },
    { href: '/firsatlar', label: 'Fırsat Masası' },
    { href: '/targets', label: 'Analist hedef fiyatları' },
    { href: '/signals', label: 'AI Sinyaller' },
    { href: '/egitim/borsa-temelleri/borsa-nasil-oynanir', label: 'Borsa rehberi' },
    { href: '/blog/bist-isi-haritasi-nasil-okunur', label: 'Isı haritası okuma' },
    { href: '/dividends', label: 'Temettü karnesi' },
  ],
  faqs: [
    {
      question: 'BİST 100 canlı fiyatı nerede izlenir?',
      answer:
        'Bullsye BİST hub ve terminalde XU100 ile hisseler düzenli yenilenir. Emir aracı kurumunuzdadır; burası izleme ve tarama içindir.',
    },
    {
      question: 'Hisse hedef fiyatı ve analist tavsiyesi nerede?',
      answer:
        'Her BİST sembol sayfasında 12 aylık konsensüs kutusu vardır. Tüm evren için /targets sayfasını kullanın. Bu yatırım tavsiyesi değildir.',
    },
  ],
};

export const SIGNALS_HUB_SEO: HubSeoContent = {
  heading: 'AI alım sinyalleri nasıl okunur?',
  paragraphs: [
    'Sinyal radarı RSI, momentum ve hareketli ortalama girdilerinden tarama kartları üretir. Ücretsiz katmanda öne çıkanları görün; teyit için Fırsat skoru ve fiyat yapısını birlikte kullanın.',
    'Sinyal yatırım tavsiyesi değildir. Blog’daki “Ücretsiz AI sinyal” yazısı ve RSI dersi ile kavramı pekiştirip aynı günün kartlarında uygulayın.',
  ],
  links: [
    { href: '/firsatlar', label: 'Fırsat Masası' },
    { href: '/egitim/teknik-analiz/rsi-indikatoru-nedir', label: 'RSI dersi' },
    { href: '/egitim/teknik-analiz/ai-firsat-skoru-nasil-okunur', label: 'Fırsat skoru' },
    { href: '/blog/ucretsiz-ai-sinyal-nasil-kullanilir', label: 'Sinyal rehberi' },
    { href: '/bist', label: 'BİST screener' },
  ],
  faqs: [
    {
      question: 'Sinyal gelince hemen almalı mıyım?',
      answer:
        'Hayır. Sinyal filtreleme aracıdır; hacim, destek ve risk limitiniz teyit edilmeden işlem yapılmamalıdır.',
    },
    {
      question: 'BİST ve kripto aynı radarda mı?',
      answer:
        'Evet. Radar birden fazla kategoriyi tarar; kategori ve skor ile listeyi daraltabilirsiniz.',
    },
  ],
};

export const US_HUB_SEO: HubSeoContent = {
  heading: 'NASDAQ ve ABD hisse analizi — nasıl kullanılır?',
  paragraphs: [
    'ABD screener’ında AAPL, NVDA, TSLA gibi likit hisseleri canlı fiyat, F/K ve analist hedefiyle izleyin. Bullsye; NASDAQ/NYSE kotlarını BİST ve kripto fırsatlarıyla aynı terminalde birleştirir.',
    'Tek hisse riskini dağıtmak için 1v1 kıyaslama ve Fırsat Masası skorlarını birlikte kullanın; alarm ile fiyat kırılımlarını kaçırmayın.',
  ],
  links: [
    { href: '/firsatlar', label: 'Fırsat Masası' },
    { href: '/signals', label: 'AI Sinyaller' },
    { href: '/targets', label: 'Hedef fiyatlar' },
    { href: '/compare', label: '1v1 kıyasla' },
    { href: '/bist', label: 'BİST screener' },
    { href: '/egitim/borsa-temelleri/fk-orani-nedir', label: 'F/K dersi' },
  ],
  faqs: [
    {
      question: 'ABD hisselerini Bullsye’da nasıl takip ederim?',
      answer:
        'NASDAQ hub’ından sembole tıklayın veya arama ile açın; grafik, sağlık karnesi, analist konsensüsü ve alarm araçları aynı sayfada.',
    },
    {
      question: 'ABD ve BİST aynı fırsat masasında mı?',
      answer:
        'Evet. Fırsat Masası ve sinyal radarı BİST, ABD ve kripto kategorilerini birlikte tarar.',
    },
  ],
};

export const CRYPTO_HUB_SEO: HubSeoContent = {
  heading: 'Kripto canlı fiyat ve sinyal — nasıl kullanılır?',
  paragraphs: [
    'Kripto screener’ında BTC, ETH ve likit altcoinleri 24s hacim, emir defteri ve momentum karnesiyle izleyin. Sinyal radarı ve Fırsat Masası ile aynı günün fırsatlarını filtreleyin.',
    'Kaldıraçlı ürünler indekslenmez; liste likit USDT paritelerine odaklanır. Alarm ve izleme listesi ile geri dönüş döngüsünü kurun.',
  ],
  links: [
    { href: '/firsatlar', label: 'Fırsat Masası' },
    { href: '/signals', label: 'AI Sinyaller' },
    { href: '/whales', label: 'Balina & Takas' },
    { href: '/egitim/teknik-analiz/rsi-indikatoru-nedir', label: 'RSI dersi' },
    { href: '/blog/kripto-sinyal-radarinda-btc-eth', label: 'BTC/ETH rehberi' },
    { href: '/bist', label: 'BİST screener' },
  ],
  faqs: [
    {
      question: 'Kripto fiyatları gecikmeli mi?',
      answer:
        'Bullsye borsa 24s ticker ve derinlik verisini düzenli yeniler. Emir iletimi bağlı olduğunuz borsadadır.',
    },
    {
      question: 'Hangi coinlerle başlamalıyım?',
      answer:
        'Önce yüksek hacimli USDT paritelerini (BTC, ETH, SOL) izleyin; düşük likidite ve kaldıraçlı ürünlerden uzak durun.',
    },
  ],
};

export const FON_HUB_SEO: HubSeoContent = {
  heading: 'TEFAS fonları ve küresel ETF’ler',
  paragraphs: [
    'Fonlar masasında TEFAS yatırım fonlarının günlük pay değeri ile VOO, QQQ gibi küresel ETF fiyatlarını aynı screener dilinde izlersiniz. Çekirdek portföy ile tek hisse riskini ayırmak için güçlü bir katmandır.',
    'Seçim kriterleri için Eğitim’deki fon/ETF dersini okuyun; temettü odaklıysa Temettü Karnesi ve SCHD gibi ürünleri çaprazlayın.',
  ],
  links: [
    { href: '/egitim/borsa-temelleri/yatirim-fonu-ve-etf-nasil-secilir', label: 'Fon & ETF dersi' },
    { href: '/dividends', label: 'Temettü karnesi' },
    { href: '/compare', label: '1v1 karşılaştırma' },
    { href: '/blog/bullsye-gunluk-rutin-rehberi', label: 'Günlük rutin' },
    { href: '/bist', label: 'BİST hisseleri' },
  ],
  faqs: [
    {
      question: 'Fon almak için Bullsye yeterli mi?',
      answer:
        'Bullsye izleme ve karşılaştırmadır. Alım-satım SPK lisanslı aracı kurum veya ilgili platform üzerinden yapılır.',
    },
    {
      question: 'ETF ile TEFAS fonu aynı mıdır?',
      answer:
        'Hayır. TEFAS fonları yerli dağıtım kanallarında; birçok küresel ETF ABD borsasında işlem görür. Kur ve erişim koşulları farklıdır.',
    },
  ],
};
