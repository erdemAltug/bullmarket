import 'server-only';
import { getCurrentSessionUser } from '@/lib/auth-user';
import { PLAN_LIMITS, type PlanId, type PlanLimits } from '@/lib/pro-plan';

/**
 * Who gets which plan. No billing yet, so plans are granted by e-mail:
 * OWNER_EMAILS (comma list, default the owner) → elite,
 * PRO_EMAILS (comma list) → pro, everyone else → free.
 */
function emails(v: string | undefined, fallback = ''): Set<string> {
  return new Set(
    (v ?? fallback)
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function planForEmail(email: string | null | undefined): PlanId {
  const e = email?.trim().toLowerCase();
  if (!e) return 'free';
  if (emails(process.env.OWNER_EMAILS, 'altgerdm@gmail.com').has(e)) return 'elite';
  if (emails(process.env.PRO_EMAILS).has(e)) return 'pro';
  return 'free';
}

export async function getCurrentPlan(): Promise<{ plan: PlanId; limits: PlanLimits }> {
  const user = await getCurrentSessionUser();
  const plan = planForEmail(user?.email);
  return { plan, limits: PLAN_LIMITS[plan] };
}
