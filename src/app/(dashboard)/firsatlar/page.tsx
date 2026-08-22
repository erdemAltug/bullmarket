import type { Metadata } from 'next';
import { CrawlSnapshot } from '@/components/seo/CrawlSnapshot';
import { getSeoSnapshot } from '@/lib/seo/live-snapshot';
import { formatMetaChange, formatMetaPrice, SITE_URL } from '@/lib/seo/symbols';
import { FirsatlarClient } from './FirsatlarClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const snap = await getSeoSnapshot();
  const lead = snap.top[0];
  const xu =
    snap.xu100Price != null
      ? `XU100 ${formatMetaPrice(snap.xu100Price, 'TRY')} ${snap.xu100Change != null ? formatMetaChange(snap.xu100Change) : ''}`
      : '';
  const extra = lead
    ? ` Bugün önde ${lead.symbol} skor ${lead.score}/100.`
    : '';
  return {
    title: 'BİST Alım Fırsatı: Canlı AI Fırsat Skoru (0–100)',
    description: `${xu}${extra} Ücretsiz günlük BİST alım fırsatı taraması — skor, bant ve hacim.`.trim(),
    openGraph: {
      title: 'BİST Alım Fırsatı ve AI Fırsat Skoru | Bullsye',
      url: `${SITE_URL}/firsatlar`,
    },
  };
}

export default async function FirsatlarPage() {
  const snap = await getSeoSnapshot();
  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">
        BİST alım fırsatı ve canlı fırsat skoru
      </h1>
      <CrawlSnapshot snap={snap} />
      <div className="mt-6">
        <FirsatlarClient />
      </div>
    </>
  );
}
