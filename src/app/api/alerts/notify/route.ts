import { NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/lib/auth-user';
import { isEmailConfigured, sendAlertEmail } from '@/lib/email/resend';

export const runtime = 'nodejs';

/** Client AlertEngine calls this when an alert fires (session user email). */
export async function POST(req: Request) {
  if (!isEmailConfigured()) {
    return NextResponse.json(
      { success: true, skipped: true, reason: 'email_not_configured' },
      { status: 200 }
    );
  }

  const user = await getCurrentSessionUser();
  const email = user?.email?.trim();
  if (!email) {
    return NextResponse.json(
      { success: false, error: 'Oturum veya e-posta yok' },
      { status: 401 }
    );
  }

  let body: {
    displaySymbol?: string;
    kindLabel?: string;
    detail?: string;
    alertId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Geçersiz gövde' }, { status: 400 });
  }

  const displaySymbol = String(body.displaySymbol ?? '').slice(0, 32);
  const kindLabel = String(body.kindLabel ?? 'Alarm').slice(0, 64);
  const detail = String(body.detail ?? '').slice(0, 280);
  if (!displaySymbol || !detail) {
    return NextResponse.json({ success: false, error: 'Eksik alan' }, { status: 400 });
  }

  const result = await sendAlertEmail({
    to: email,
    displaySymbol,
    kindLabel,
    detail,
  });

  if (result.skipped) {
    return NextResponse.json({ success: true, skipped: true });
  }
  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: result.error ?? 'Gönderilemedi' },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
