import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/db';
import { digestSubscriptions } from '@/db/schema';
import { getCurrentSessionUser } from '@/lib/auth-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Signed-in user's morning digest opt-in state. */
export async function GET() {
  const user = await getCurrentSessionUser();
  if (!user?.id || !isDatabaseConfigured()) {
    return NextResponse.json({ success: true, data: { available: false, active: false } });
  }
  const [row] = await getDb()
    .select({ active: digestSubscriptions.active })
    .from(digestSubscriptions)
    .where(eq(digestSubscriptions.userId, user.id))
    .limit(1);
  return NextResponse.json({
    success: true,
    data: { available: true, active: Boolean(row?.active) },
  });
}

export async function POST(req: Request) {
  const user = await getCurrentSessionUser();
  const email = user?.email?.trim();
  if (!user?.id || !email) {
    return NextResponse.json(
      { success: false, error: 'Oturum veya e-posta yok' },
      { status: 401 }
    );
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Veritabanı yapılandırılmamış' },
      { status: 503 }
    );
  }

  let active = true;
  try {
    const body = (await req.json()) as { active?: boolean };
    active = body.active !== false;
  } catch {
    /* default: subscribe */
  }

  await getDb()
    .insert(digestSubscriptions)
    .values({ userId: user.id, email, active })
    .onConflictDoUpdate({
      target: digestSubscriptions.userId,
      set: { email, active },
    });

  return NextResponse.json({ success: true, data: { available: true, active } });
}
