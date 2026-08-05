import { CRYPTO_HUB_SEO, HubSeoBlock } from '@/components/seo/HubSeoBlock';
import { SymbolDirectory } from '@/components/seo/SymbolDirectory';
import { SEO_CRYPTO_SYMBOLS } from '@/lib/seo/symbols';
import { CryptoHubClient } from './CryptoHubClient';

export default function CryptoPage() {
  return (
    <>
      <CryptoHubClient />
      <HubSeoBlock content={CRYPTO_HUB_SEO} />
      <SymbolDirectory
        title="Kripto para canlı fiyat ve analizleri"
        description={`${SEO_CRYPTO_SYMBOLS.length} USDT paritesi için canlı fiyat, hacim, momentum karnesi, topluluk konsensüsü ve alarm araçları.`}
        symbols={SEO_CRYPTO_SYMBOLS}
        kind="crypto"
      />
    </>
  );
}
