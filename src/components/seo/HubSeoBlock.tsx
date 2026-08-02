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
    'Borsa İstanbul screener’ında hisseleri filtreleyin, sparkline ve watchlist ile izleyin, grafik panelinden kısa vadeli yapıyı okuyun. Bullsye; canlı fiyatı sinyal, fırsat skoru ve eğitim içerikleriyle aynı terminalde birleştirir.',
    'Yeni başlıyorsanız Eğitim Hub’daki “Borsa nasıl oynanır?” dersini, günlük ritim için Blog’daki 10 dakikalık rutini okuyun; ardından Fırsat Masası’nda skor kartlarına geçin.',
  ],
  links: [
    { href: '/bist/heatmap', label: 'Isı haritası' },
    { href: '/firsatlar', label: 'Fırsat Masası' },
    { href: '/signals', label: 'AI Sinyaller' },
    { href: '/egitim/borsa-temelleri/borsa-nasil-oynanir', label: 'Borsa rehberi' },
    { href: '/blog/bist-isi-haritasi-nasil-okunur', label: 'Isı haritası okuma' },
    { href: '/dividends', label: 'Temettü karnesi' },
  ],
  faqs: [
    {
      question: 'BİST canlı fiyatları gecikmeli mi?',
      answer:
        'Bullsye piyasa verisini düzenli yeniler. Emir iletimi aracı kurumunuzdadır; terminal izleme ve analiz içindir.',
    },
    {
      question: 'Hangi hisseyle başlamalıyım?',
      answer:
        'Önce likit BİST 30 adaylarını screener ve Fırsat Masası ile daraltın; tek hisseye tüm riski bağlamayın.',
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
