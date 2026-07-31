import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { FxConverter } from '@/components/dashboard/FxConverter';
import { AssetSeoShell } from '@/components/seo/AssetSeoShell';
import { fetchFxRates } from '@/lib/api/tcmb';
import { resolveSeoLang, withLangAlternates } from '@/lib/seo/hreflang';
import {
  SITE_URL,
  SEO_FX_PAIRS,
  formatMetaChange,
  formatMetaPrice,
  fxPairParts,
} from '@/lib/seo/symbols';

export const revalidate = 120;

type Props = {
  params: Promise<{ pair: string }>;
  searchParams: Promise<{ lang?: string }>;
};

function normalizePair(raw: string): string {
  const { base, quote } = fxPairParts(raw);
  return `${base}-${quote}`;
}

export async function generateStaticParams() {
  return SEO_FX_PAIRS.map((pair) => ({ pair }));
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const pair = normalizePair((await params).pair);
  const { base, quote } = fxPairParts(pair);
  const lang = resolveSeoLang((await searchParams).lang);
  const isTr = lang === 'tr';

  let priceNum = 0;
  let changeNum = 0;
  let name = `${base}/${quote}`;
  try {
    const metaCode = base === 'XAU' ? 'GOLD' : base;
    const { rates } = await fetchFxRates([metaCode]);
    const r = rates[0];
    if (r) {
      priceNum = r.forexSelling || r.forexBuying;
      changeNum = r.changePercent ?? 0;
      name = r.name || name;
    }
  } catch {
    /* ignore */
  }

  const price = formatMetaPrice(priceNum, 'TRY');
  const change = formatMetaChange(changeNum);
  const humanTr =
    base === 'USD'
      ? 'Dolar kaç TL'
      : base === 'EUR'
        ? 'Euro kaç TL'
        : base === 'GBP'
          ? 'Sterlin kaç TL'
          : base === 'XAU'
            ? 'Gram altın fiyatı'
            : `${base} ${quote}`;
  const humanEn =
    base === 'XAU' ? 'Gold price TRY' : `${base} to TRY live rate`;

  const title = isTr
    ? `${humanTr}? ${price} TL (${change}) — Bullsye`
    : `${humanEn}: ${price} TRY (${change}) — Bullsye`;
  const description = isTr
    ? `${base}/${quote} canlı döviz kuru ${price} TL. Anlık TCMB verisi, dönüştürücü ve değişim oranı Bullsye'da.`
    : `Live ${base}/${quote} FX rate at ${price} TRY. TCMB-based quotes and converter on Bullsye.`;
  const ogImage = `${SITE_URL}/api/og?symbol=${encodeURIComponent(`${base}/${quote}`)}&price=${encodeURIComponent(`₺${price}`)}&change=${encodeURIComponent(change)}&label=${encodeURIComponent(isTr ? 'Döviz' : 'FX')}&lang=${lang}`;
  const path = `/fx/${pair}`;

  return {
    title: { absolute: title },
    description,
    keywords: isTr
      ? [humanTr, `${base} TRY`, 'canlı döviz']
      : [humanEn, `${base} TRY`, 'live FX'],
    alternates: withLangAlternates(path),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      locale: isTr ? 'tr_TR' : 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${base}/${quote} ₺${price} ${change}`,
      images: [ogImage],
    },
  };
}

export default async function FxPairPage({ params }: Props) {
  const raw = (await params).pair;
  const pair = normalizePair(raw);
  if (raw.toUpperCase().replace('_', '-') !== pair) {
    permanentRedirect(`/fx/${pair}`);
  }

  const { base } = fxPairParts(pair);
  const code = base === 'XAU' ? 'GOLD' : base;
  let price = 0;
  let changePercent = 0;
  let name = `${base}/TRY`;
  let allRates: Awaited<ReturnType<typeof fetchFxRates>>['rates'] = [];

  try {
    const data = await fetchFxRates(['USD', 'EUR', 'GBP', 'GOLD', code]);
    allRates = data.rates;
    const r =
      data.rates.find((x) => x.code === code) ??
      data.rates.find((x) => x.code === 'GOLD' && base === 'XAU');
    if (r) {
      price = r.forexSelling || r.forexBuying;
      changePercent = r.changePercent ?? 0;
      name = r.name || name;
    }
  } catch {
    /* empty */
  }

  return (
    <AssetSeoShell
      symbol={`${base}/TRY`}
      name={name}
      price={price}
      changePercent={changePercent}
      currency="TRY"
      currencySymbol="₺"
      kind="fx"
      faqs={[
        {
          question: `${base} kaç TL?`,
          answer: `Güncel ${base}/TRY satış kuru ₺${price.toLocaleString('tr-TR', { maximumFractionDigits: 4 })} seviyesindedir.`,
        },
        {
          question: 'Kurlar nereden geliyor?',
          answer:
            "Bullsye döviz kurlarını TCMB verilerine dayalı olarak günceller.",
        },
        {
          question: 'Döviz çevirici var mı?',
          answer:
            'Evet — bu sayfadaki dönüştürücü ile TRY ↔ döviz hesabı yapabilirsiniz.',
        },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <MetricCard
          title={`${base}/TRY`}
          value={price}
          changePercent={changePercent}
          currency="TRY"
        />
        {allRates.length ? <FxConverter rates={allRates} /> : null}
      </div>
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 text-sm leading-relaxed text-zinc-400">
        <h2 className="mb-2 text-base font-semibold text-zinc-100">
          {base}/TRY canlı kur
        </h2>
        <p>
          {name} için güncel kur, günlük değişim ve hızlı dönüştürücü bu
          sayfada. Dolar, euro ve diğer pariteler Bullsye FX bölümünden
          takip edilebilir.
        </p>
      </section>
    </AssetSeoShell>
  );
}
