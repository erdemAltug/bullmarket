import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/db';
import { portfolioReportSubscriptions } from '@/db/schema';
import { captureServerEvent } from '@/lib/analytics-server';
import { isEmailConfigured, sendPortfolioReportEmail } from '@/lib/email/resend';
import { buildPortfolioReport } from '@/lib/portfolio-report';
import { SITE_URL } from '@/lib/seo/symbols';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Six days, so a late or repeated weekly run never sends twice. */
const MIN_GAP_MS = 6 * 86_400_000;

/** Weekly portfolio check-up e-mail to everyone who opted in. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!isEmailConfigured() || !isDatabaseConfigured()) {
    return NextResponse.json({ success: true, skipped: true });
  }

  const db = getDb();
  const subs = await db
    .select()
    .from(portfolioReportSubscriptions)
    .where(eq(portfolioReportSubscriptions.active, true));

  let sent = 0;
  let empty = 0;
  let failed = 0;
  for (const s of subs) {
    if (s.lastSentAt && Date.now() - s.lastSentAt.getTime() < MIN_GAP_MS) continue;
    const report = await buildPortfolioReport(s.userId).catch(() => null);
    if (!report) {
      empty += 1;
      continue;
    }
    const res = await sendPortfolioReportEmail({
      to: s.email,
      report,
      unsubscribeUrl: `${SITE_URL}/api/portfolio-report/unsubscribe?token=${s.token}`,
    });
    if (res.ok) {
      sent += 1;
      await db
        .update(portfolioReportSubscriptions)
        .set({ lastSentAt: new Date() })
        .where(eq(portfolioReportSubscriptions.userId, s.userId));
    } else {
      failed += 1;
    }
  }

  await captureServerEvent('portfolio_report_sent', 'bullsye-server', {
    subscribers: subs.length,
    sent,
    empty,
    failed,
  });
  return NextResponse.json({ success: true, subscribers: subs.length, sent, empty, failed });
}
