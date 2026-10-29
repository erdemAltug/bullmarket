import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/db';
import { digestSubscriptions } from '@/db/schema';
import { SITE_URL } from '@/lib/seo/symbols';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function unsubscribe(token: string | null) {
  if (token && UUID.test(token) && isDatabaseConfigured()) {
    await getDb()
      .update(digestSubscriptions)
      .set({ active: false })
      .where(eq(digestSubscriptions.token, token));
  }
}

/** One-click link from the e-mail footer. */
export async function GET(req: Request) {
  await unsubscribe(new URL(req.url).searchParams.get('token'));
  return NextResponse.redirect(`${SITE_URL}/alerts?digest=off`, 303);
}

/** RFC 8058 List-Unsubscribe-Post from mail clients. */
export async function POST(req: Request) {
  await unsubscribe(new URL(req.url).searchParams.get('token'));
  return NextResponse.json({ success: true });
}
