import { ScoreRankingPage, rankingMetadata } from '@/components/seo/ScoreRankingPage';
import { RANKINGS } from '@/lib/seo/rankings';

export const revalidate = 900;

export const metadata = rankingMetadata(RANKINGS.cryptoTop);

export default function Page() {
  return <ScoreRankingPage cfg={RANKINGS.cryptoTop} />;
}
