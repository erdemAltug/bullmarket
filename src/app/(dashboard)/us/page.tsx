import { US_HUB_SEO, HubSeoBlock } from '@/components/seo/HubSeoBlock';
import { SymbolDirectory } from '@/components/seo/SymbolDirectory';
import { SEO_US_TICKERS } from '@/lib/seo/symbols';
import { UsHubClient } from './UsHubClient';

export default function UsPage() {
  return (
    <>
      <UsHubClient />
      <HubSeoBlock content={US_HUB_SEO} />
      <SymbolDirectory
        title="NASDAQ ve ABD hisse analizleri"
        description={`${SEO_US_TICKERS.length} likit ABD hissesi için canlı fiyat, grafik, sağlık karnesi, analist hedefi ve topluluk görüşü.`}
        symbols={SEO_US_TICKERS}
        kind="us"
      />
    </>
  );
}
