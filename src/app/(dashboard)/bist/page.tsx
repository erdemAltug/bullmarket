import type { Metadata } from 'next';
import { BIST_HUB_SEO, HubSeoBlock } from '@/components/seo/HubSeoBlock';
import { CrawlSnapshot } from '@/components/seo/CrawlSnapshot';
import { SymbolDirectory } from '@/components/seo/SymbolDirectory';
import { getSeoSnapshot } from '@/lib/seo/live-snapshot';
import {
  formatMetaChange,
  formatMetaPrice,
  SEO_BIST_TICKERS,
  SITE_URL,
} from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { BistHubClient } from './BistHubClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const snap = await getSeoSnapshot();
  const live =
    snap.xu100Price != null
      ? `BİST 100 ${formatMetaPrice(snap.xu100Price, 'TRY')} (${snap.xu100Change != null ? formatMetaChange(snap.xu100Change) : 'canlı'})`
      : 'BİST 100 canlı';
  return {
    title: `${live} — Hisse Fiyatları ve Tarama`,
    description: `${live}. Ücretsiz Borsa İstanbul kotasyonları, tarama, ısı haritası ve hisse karnesi.`,
    alternates: withLangAlternates('/bist'),
    openGraph: {
      title: `${live} | Bullsye`,
      url: `${SITE_URL}/bist`,
    },
  };
}

export default async function BistPage() {
  const snap = await getSeoSnapshot();
  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">
        BİST 100 canlı hisse fiyatları
      </h1>
      <CrawlSnapshot snap={snap} />
      <div className="mt-6">
        <BistHubClient />
      </div>
      <HubSeoBlock content={BIST_HUB_SEO} />
      <SymbolDirectory
        title="Borsa İstanbul hisse analizleri"
        description={`${SEO_BIST_TICKERS.length} BİST hissesi ve endeksi için canlı fiyat, grafik, hedef fiyat ve alarm.`}
        symbols={SEO_BIST_TICKERS}
        kind="bist"
      />
    </>
  );
}
