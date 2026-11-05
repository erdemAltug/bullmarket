import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ScoreRankingPage, rankingMetadata } from '@/components/seo/ScoreRankingPage';
import { bistSectorConfig } from '@/lib/seo/rankings';
import { BIST_SECTORS } from '@/lib/seo/sectors';

export const revalidate = 900;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BIST_SECTORS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const def = BIST_SECTORS.find((s) => s.slug === slug);
  return def ? rankingMetadata(bistSectorConfig(def)) : {};
}

export default async function BistSectorPage({ params }: Props) {
  const { slug } = await params;
  const def = BIST_SECTORS.find((s) => s.slug === slug);
  if (!def) notFound();
  return <ScoreRankingPage cfg={bistSectorConfig(def)} />;
}
