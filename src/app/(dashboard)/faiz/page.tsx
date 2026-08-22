import { HubSeoBlock, RATES_HUB_SEO } from '@/components/seo/HubSeoBlock';
import { RatesHubClient } from '@/components/dashboard/RatesHubClient';

export default function RatesPage() {
  return (
    <>
      <RatesHubClient />
      <HubSeoBlock content={RATES_HUB_SEO} />
    </>
  );
}
