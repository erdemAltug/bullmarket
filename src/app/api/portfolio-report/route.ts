import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/db';
import { portfolioReportSubscriptions } from '@/db/schema';
import { getCurrentSessionUser } from '@/lib/auth-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Signed-in user's weekly portfolio report opt-in. */
export async function GET() {
  const user = await getCurrentSessionUser();
  if (!user?.id || !isDatabaseConfigured()) {
    return NextResponse.json({ success: true, data: { available: false, active: false } });
  }
  try {
    const [row] = await getDb()
      .select({ active: portfolioReportSubscriptions.active })
      .from(portfolioReportSubscriptions)
      .where(eq(portfolioReportSubscriptions.userId, user.id))
      .limit(1);
    return NextResponse.json({ success: true, data: { available: true, active: Boolean(row?.active) } });
  } catch {
    return NextResponse.json({ success: true, data: { available: false, active: false } });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentSessionUser();
  const email = user?.email?.trim();
  if (!user?.id || !email) {
    return NextResponse.json({ success: false, error: 'Giriş yapman gerekiyor' }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, error: 'Şu an kaydedilemiyor' }, { status: 503 });
  }
  let active = true;
  try {
    const body = (await req.json()) as { active?: boolean };
    active = body.active !== false;
  } catch {
    /* default: subscribe */
  }
  await getDb()
    .insert(portfolioReportSubscriptions)
    .values({ userId: user.id, email, active })
    .onConflictDoUpdate({ target: portfolioReportSubscriptions.userId, set: { email, active } });
  return NextResponse.json({ success: true, data: { available: true, active } });
}
