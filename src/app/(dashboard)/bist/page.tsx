import { BIST_HUB_SEO, HubSeoBlock } from '@/components/seo/HubSeoBlock';
import { SymbolDirectory } from '@/components/seo/SymbolDirectory';
import { SEO_BIST_TICKERS } from '@/lib/seo/symbols';
import { BistHubClient } from './BistHubClient';

export default function BistPage() {
  return (
    <>
      <BistHubClient />
      <HubSeoBlock content={BIST_HUB_SEO} />
      <SymbolDirectory
        title="Borsa İstanbul hisse analizleri"
        description={`${SEO_BIST_TICKERS.length} BİST hissesi ve endeksi için canlı fiyat, grafik, temel analiz karnesi, topluluk konsensüsü ve alarm araçlarına ulaşın.`}
        symbols={SEO_BIST_TICKERS}
        kind="bist"
      />
    </>
  );
}
