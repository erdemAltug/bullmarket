import { ScoreRankingPage, rankingMetadata } from '@/components/seo/ScoreRankingPage';
import { SectorLeaders } from '@/components/seo/SectorLeaders';
import { YEARLY } from '@/lib/seo/rankings';
import { BIST_SECTORS } from '@/lib/seo/sectors';

export const revalidate = 900;

export const metadata = rankingMetadata(YEARLY.bist);

export default function Page() {
  return (
    <ScoreRankingPage cfg={YEARLY.bist}>
      <SectorLeaders category="BIST" sectors={BIST_SECTORS} basePath="/bist/sektor" />
    </ScoreRankingPage>
  );
}
