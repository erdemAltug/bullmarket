import type { Metadata } from 'next';
import { CrawlSnapshot } from '@/components/seo/CrawlSnapshot';
import { getIndexQuote } from '@/lib/seo/live-snapshot';
import { formatMetaChange, formatMetaPrice } from '@/lib/seo/symbols';

export async function generateMetadata(): Promise<Metadata> {
  const idx = await getIndexQuote();
  const live =
    idx.price != null
      ? `XU100 ${formatMetaPrice(idx.price, 'TRY')} ${idx.change != null ? formatMetaChange(idx.change) : ''}`
      : 'Canlı BİST terminali';
  return {
    title: `${live} — Fırsat Skoru, Radar ve Alarm`,
    description:
      'Ücretsiz sabah BİST terminali: canlı fırsat skoru, radar ve fiyat alarmı. 10 dakikalık piyasa rutini — kayıt zorunlu değil.',
  };
}

export default async function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const idx = await getIndexQuote();
  const snap = {
    xu100Price: idx.price,
    xu100Change: idx.change,
    top: [] as {
      symbol: string;
      score: number;
      href: string | null;
      changePercent: number;
    }[],
    asOf: new Date().toISOString(),
  };
  return (
    <>
      <CrawlSnapshot snap={snap} variant="compact" />
      <div className="mt-4">{children}</div>
    </>
  );
}
