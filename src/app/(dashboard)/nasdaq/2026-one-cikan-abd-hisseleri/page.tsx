import { ScoreRankingPage, rankingMetadata } from '@/components/seo/ScoreRankingPage';
import { SectorLeaders } from '@/components/seo/SectorLeaders';
import { YEARLY } from '@/lib/seo/rankings';
import { US_SECTORS } from '@/lib/seo/sectors';

export const revalidate = 900;

export const metadata = rankingMetadata(YEARLY.us);

export default function Page() {
  return (
    <ScoreRankingPage cfg={YEARLY.us}>
      <SectorLeaders category="US" sectors={US_SECTORS} basePath="/nasdaq/sektor" />
    </ScoreRankingPage>
  );
}
