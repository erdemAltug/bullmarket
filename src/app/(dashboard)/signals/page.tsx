import { HubSeoBlock, SIGNALS_HUB_SEO } from '@/components/seo/HubSeoBlock';
import { SignalsHubClient } from './SignalsHubClient';

export default function SignalsPage() {
  return (
    <>
      <SignalsHubClient />
      <HubSeoBlock content={SIGNALS_HUB_SEO} />
    </>
  );
}
