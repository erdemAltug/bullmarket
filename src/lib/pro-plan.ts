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

export type PlanId = 'free' | 'pro' | 'elite';

export type PlanLimits = {
  /** Active (not yet triggered) price alerts at once. */
  activeAlerts: number;
  /** Days of score history shown on symbol pages. */
  scoreHistoryDays: number;
};

/** Per-plan caps. Change here; server checks and UI both follow. */
export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: { activeAlerts: 3, scoreHistoryDays: 7 },
  pro: { activeAlerts: 25, scoreHistoryDays: 90 },
  elite: { activeAlerts: 1000, scoreHistoryDays: 365 },
};

export const PLAN_LABEL: Record<PlanId, string> = { free: 'Ücretsiz', pro: 'Pro', elite: 'Elite' };

/** Elite tier price (no payment taken yet). */
export const ELITE_PRICE = { monthly: 449, yearly: 4490 } as const;

/** Back-compat alias: free plan caps. */
export const FREE_LIMITS = PLAN_LIMITS.free;

export type ProPlanChoice = 'monthly' | 'yearly';

export const PRO_FEATURES = [
  { id: 'alerts', label: '25 fiyat alarmı', detail: 'Ücretsizde aynı anda 3 alarm; Pro’da 25' },
  { id: 'fast', label: 'Daha sık alarm kontrolü', detail: 'Alarmlar 5 dakikada bir kontrol edilir (ücretsizde 10 dk)' },
  { id: 'history', label: 'Skor geçmişi (90 gün)', detail: 'Ücretsizde son 7 gün; Pro’da 90 gün, grafikle' },
  { id: 'digest', label: 'Kişisel sabah özeti', detail: 'Senin listen ve portföyün için 08:30 e-postası' },
  { id: 'report', label: 'Portföy doktoru raporu', detail: 'Her pazartesi e-postanda: yoğunlaşma, sektör ve döviz dağılımı, hedef fiyat ve skor değişimi' },
  { id: 'export', label: 'CSV dışa aktarma', detail: 'İzleme listesi, alarm ve portföy verisi' },
] as const;

export type ProFeatureId = (typeof PRO_FEATURES)[number]['id'];

export const FREE_FEATURES = [
  'Skor taraması, hedef fiyatlar, grafikler',
  'İzleme listesi',
  'Aynı anda 3 fiyat alarmı, e-posta ile',
  'Son 7 günün skor geçmişi',
  'Genel sabah özeti (ilk 5 skor)',
  'Envanter ve portföy takibi',
] as const;

/** Elite: everything in Pro, plus these. */
export const ELITE_FEATURES = [
  'Pro’daki her şey',
  'Pratikte sınırsız alarm (1000)',
  '1 yıllık skor geçmişi',
  'Skor değişim alarmı: izlediklerinin skoru 10 puan oynayınca e-posta',
  'Öncelikli destek ve yeni özelliklere ilk erişim',
] as const;

export function formatTl(n: number): string {
  return `${n.toLocaleString('tr-TR')} TL`;
}
