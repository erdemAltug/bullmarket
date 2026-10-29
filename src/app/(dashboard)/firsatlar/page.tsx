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
    title: 'BİST Skor Taraması: Analiz Skoru (0–100)',
    description: `${xu}${extra} Ücretsiz günlük BİST taraması — analiz skoru, bant ve hacim.`.trim(),
    openGraph: {
      title: 'BİST Skor Taraması ve Analiz Skoru | Bullsye',
      url: `${SITE_URL}/firsatlar`,
      // Live top-3 card; refreshed every 15 min at the CDN.
      images: [
        {
          url: `${SITE_URL}/api/og?type=radar`,
          width: 1200,
          height: 630,
          alt: 'Bullsye — günün 3 yüksek skoru',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`${SITE_URL}/api/og?type=radar`],
    },
  };
}

export default async function FirsatlarPage() {
  const snap = await getSeoSnapshot();
  return (
    <>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">
        Skor taraması
      </h1>
      <CrawlSnapshot snap={snap} />
      <div className="mt-6">
        <FirsatlarClient />
      </div>
    </>
  );
}
