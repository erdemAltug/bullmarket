import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/db';
import { portfolioReportSubscriptions } from '@/db/schema';
import { SITE_URL } from '@/lib/seo/symbols';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f-]{36}$/i;

/** One-click unsubscribe from the weekly portfolio report e-mail. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  if (UUID.test(token) && isDatabaseConfigured()) {
    await getDb()
      .update(portfolioReportSubscriptions)
      .set({ active: false })
      .where(eq(portfolioReportSubscriptions.token, token))
      .catch(() => undefined);
  }
  return NextResponse.redirect(`${SITE_URL}/portfolio/rapor?abonelik=kapandi`);
}
