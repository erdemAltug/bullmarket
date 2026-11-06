import { NextResponse } from 'next/server';
import { getCurrentPlan } from '@/lib/entitlements';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/me/plan → the signed-in user's plan and limits. */
export async function GET() {
  const data = await getCurrentPlan();
  return NextResponse.json({ success: true, data }, { headers: { 'Cache-Control': 'private, no-store' } });
}
