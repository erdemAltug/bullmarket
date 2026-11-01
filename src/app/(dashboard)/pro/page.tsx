import type { Metadata } from 'next';
import { PricingView } from '@/components/pro/PricingView';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'Bullsye Pro — Sınırsız Alarm, Skor Geçmişi, Portföy Raporu',
  description:
    'Ücretsiz plan her zaman açık. Pro: sınırsız alarm, hızlı kontrol, 90 gün skor geçmişi, kişisel sabah özeti. Erken erişim talep et.',
  alternates: withLangAlternates('/pro'),
};

export default function ProPage() {
  return <PricingView />;
}
