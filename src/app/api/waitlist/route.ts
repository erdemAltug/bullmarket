import { NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/db';
import { proWaitlist } from '@/db/schema';
import { getCurrentSessionUser } from '@/lib/auth-user';
import { sendAlertEmail } from '@/lib/email/resend';
import { PRO_FEATURES } from '@/lib/pro-plan';

export const runtime = 'nodejs';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FEATURE_IDS = new Set<string>(PRO_FEATURES.map((f) => f.id));

/**
 * Pro early-access request. Guests pass an e-mail; signed-in users may omit
 * it. Re-submitting updates the plan/features instead of duplicating.
 */
export async function POST(req: Request) {
  let body: { email?: string; source?: string; plan?: string; features?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Geçersiz gövde' }, { status: 400 });
  }

  const user = await getCurrentSessionUser();
  const email = String(body.email || user?.email || '')
    .trim()
    .toLowerCase()
    .slice(0, 254);
  if (!EMAIL.test(email)) {
    return NextResponse.json({ success: false, error: 'Geçerli bir e-posta girin' }, { status: 400 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, error: 'Şu an kayıt alınamıyor' }, { status: 503 });
  }

  const source = String(body.source || 'unknown').replace(/[^a-z0-9_-]/gi, '').slice(0, 32);
  const plan = body.plan === 'monthly' || body.plan === 'yearly' ? body.plan : null;
  const features = Array.isArray(body.features)
    ? body.features.filter((f) => FEATURE_IDS.has(f)).join(',') || null
    : null;

  const [row] = await getDb()
    .insert(proWaitlist)
    .values({ email, userId: user?.id ?? null, source, plan, features })
    .onConflictDoUpdate({
      target: proWaitlist.email,
      set: { plan, features, ...(user?.id ? { userId: user.id } : {}) },
    })
    .returning({ createdAt: proWaitlist.createdAt });

  // Owner heads-up for brand-new requests (optional, needs PRO_LEADS_EMAIL).
  const notifyTo = process.env.PRO_LEADS_EMAIL?.trim();
  const isNew = row && Date.now() - new Date(row.createdAt).getTime() < 10_000;
  if (notifyTo && isNew) {
    await sendAlertEmail({
      to: notifyTo,
      displaySymbol: 'Yeni Pro talebi',
      kindLabel: `${plan ?? 'plan seçilmedi'} · ${source}`,
      detail: `${email}${features ? ` — ${features}` : ''}`,
      href: 'https://eu.posthog.com',
    }).catch(() => undefined);
  }

  return NextResponse.json({ success: true });
}
