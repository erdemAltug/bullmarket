import { NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/db';
import { proWaitlist } from '@/db/schema';
import { getCurrentSessionUser } from '@/lib/auth-user';

export const runtime = 'nodejs';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Pro waitlist sign-up. Guests pass an e-mail; signed-in users may omit it. */
export async function POST(req: Request) {
  let body: { email?: string; source?: string } = {};
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
  await getDb()
    .insert(proWaitlist)
    .values({ email, userId: user?.id ?? null, source })
    .onConflictDoNothing({ target: proWaitlist.email });

  return NextResponse.json({ success: true });
}
