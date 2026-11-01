import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/db';
import { digestSubscriptions } from '@/db/schema';
import { buildDailyDigest, formatDigestDate } from '@/lib/daily-digest';
import { captureServerEvent } from '@/lib/analytics-server';
import { isEmailConfigured, sendDigestEmails } from '@/lib/email/resend';
import { SITE_URL } from '@/lib/seo/symbols';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Weekday morning digest. Called by .github/workflows/morning-digest.yml
 * with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!isEmailConfigured() || !isDatabaseConfigured()) {
    return NextResponse.json({ success: true, skipped: true });
  }

  const digest = await buildDailyDigest(5);
  if (!digest.cards.length) {
    return NextResponse.json({ success: false, error: 'no_market_data' }, { status: 502 });
  }

  const db = getDb();
  const subs = await db
    .select({ email: digestSubscriptions.email, token: digestSubscriptions.token })
    .from(digestSubscriptions)
    .where(eq(digestSubscriptions.active, true));

  const result = await sendDigestEmails({
    dateLabel: formatDigestDate(digest.asOf),
    headline: digest.vision?.headline,
    rows: digest.cards.map((c) => ({
      displaySymbol: c.displaySymbol,
      name: c.name,
      score: c.score,
      changePercent: c.changePercent,
      reason: c.catalysts[0],
      href: `${SITE_URL}${c.href ?? '/firsatlar'}?utm_source=email&utm_medium=digest`,
    })),
    recipients: subs.map((s) => ({
      email: s.email,
      unsubscribeUrl: `${SITE_URL}/api/digest/unsubscribe?token=${s.token}`,
    })),
  });

  await captureServerEvent('digest_sent', 'bullsye-server', {
    subscribers: subs.length,
    sent: result.sent,
    failed: result.failed,
  });

  if (result.sent > 0) {
    await db
      .update(digestSubscriptions)
      .set({ lastSentAt: new Date() })
      .where(eq(digestSubscriptions.active, true));
  }

  return NextResponse.json({ success: true, subscribers: subs.length, ...result });
}
