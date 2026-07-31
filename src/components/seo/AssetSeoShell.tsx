import {
  FinancialSchema,
  FaqSchema,
} from '@/components/seo/FinancialSchema';

interface SeoShellProps {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  currency: 'TRY' | 'USD';
  currencySymbol: string;
  kind: 'bist' | 'crypto' | 'fx';
  children: React.ReactNode;
  faqs?: { question: string; answer: string }[];
}

export function AssetSeoShell({
  symbol,
  name,
  price,
  changePercent,
  currency,
  currencySymbol,
  kind,
  children,
  faqs,
}: SeoShellProps) {
  const positive = changePercent >= 0;
  const kindLabel =
    kind === 'bist' ? 'Hisse' : kind === 'crypto' ? 'Kripto' : 'Döviz';

  const defaultFaqs = [
    {
      question: `${symbol} canlı fiyatı nedir?`,
      answer: `${name} (${symbol}) güncel fiyatı ${currencySymbol}${price.toLocaleString('tr-TR')} seviyesindedir. Günlük değişim %${changePercent.toFixed(2)}.`,
    },
    {
      question: `${symbol} grafiği nereden takip edilir?`,
      answer: `${symbol} anlık grafik, teknik göstergeler ve alarm kurulumu Bullseye ${kindLabel.toLowerCase()} sayfasında yer alır.`,
    },
    {
      question: `${symbol} hakkında nasıl alarm kurulur?`,
      answer: `Bullseye üzerinde ${symbol} için fiyat üstü/altı ve yüzde değişim alarmları oluşturabilirsiniz.`,
    },
  ];

  return (
    <article className="space-y-6">
      <FinancialSchema
        symbol={symbol}
        name={name}
        price={price}
        currency={currency}
        changePercent={changePercent}
      />
      <FaqSchema items={faqs ?? defaultFaqs} />

      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {kindLabel} · Canlı
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          {symbol}{' '}
          <span className="text-lg font-normal text-zinc-400">· {name}</span>
        </h1>
        <p className="text-sm text-zinc-500">
          Canlı fiyat, grafik ve analiz — Bullseye
        </p>
        <p
          className={`text-2xl font-semibold tabular-nums ${
            positive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {currencySymbol}
          {price.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}{' '}
          <span className="text-base font-medium">
            ({positive ? '+' : ''}
            {changePercent.toFixed(2)}%)
          </span>
        </p>
      </header>

      {children}
    </article>
  );
}
