import { FON_HUB_SEO, HubSeoBlock } from '@/components/seo/HubSeoBlock';
import { FonHubClient } from './FonHubClient';

export default function FonHubPage() {
  return (
    <>
      <FonHubClient />
      <HubSeoBlock content={FON_HUB_SEO} />
    </>
  );
}
