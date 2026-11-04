/**
 * Pro plan offer shown on /pro. Single source of truth for prices and the
 * founding-member promise — change here, every CTA follows.
 * No payment is taken yet: the CTA records an early-access request.
 */
export const PRO_PRICE = {
  monthly: 199,
  yearly: 1990,
  /** Founding members (first FOUNDER_SEATS requests) keep this monthly price. */
  founderMonthly: 149,
} as const;

export const FOUNDER_SEATS = 100;

export type ProPlanChoice = 'monthly' | 'yearly';

export const PRO_FEATURES = [
  { id: 'alerts', label: 'Sınırsız alarm', detail: 'Fiyat, % hareket, RSI ve skor alarmı — sayı sınırı yok' },
  { id: 'fast', label: 'Daha sık alarm kontrolü', detail: 'Alarmlar 5 dakikada bir kontrol edilir (ücretsizde 10 dk)' },
  { id: 'history', label: 'Skor geçmişi (90 gün)', detail: 'Bir hissenin skoru nasıl değişti, grafikle' },
  { id: 'digest', label: 'Kişisel sabah özeti', detail: 'Senin listen ve portföyün için 08:30 e-postası' },
  { id: 'report', label: 'Portföy doktoru raporu', detail: 'Yoğunlaşma, nakit dengesi, hedef fiyat özeti' },
  { id: 'export', label: 'CSV dışa aktarma', detail: 'İzleme listesi, alarm ve portföy verisi' },
] as const;

export type ProFeatureId = (typeof PRO_FEATURES)[number]['id'];

export const FREE_FEATURES = [
  'Skor taraması, hedef fiyatlar, grafikler',
  'İzleme listesi',
  'Alarmlar, e-posta ile (açık betada sınırsız)',
  'Genel sabah özeti (ilk 5 skor)',
  'Envanter ve portföy takibi',
] as const;

export function formatTl(n: number): string {
  return `${n.toLocaleString('tr-TR')} TL`;
}
