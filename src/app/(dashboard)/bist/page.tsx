import { BIST_HUB_SEO, HubSeoBlock } from '@/components/seo/HubSeoBlock';
import { BistHubClient } from './BistHubClient';

export default function BistPage() {
  return (
    <>
      <BistHubClient />
      <HubSeoBlock content={BIST_HUB_SEO} />
    </>
  );
}
