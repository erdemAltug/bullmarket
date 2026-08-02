import 'server-only';
import { Resend } from 'resend';
import { SITE_URL } from '@/lib/seo/symbols';

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function fromAddress(): string {
  return (
    process.env.RESEND_FROM?.trim() ||
    'Bullsye <onboarding@resend.dev>'
  );
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export async function sendAlertEmail(input: {
  to: string;
  displaySymbol: string;
  kindLabel: string;
  detail: string;
  href?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { ok: false, skipped: true };

  const link = input.href ?? `${SITE_URL}/alerts`;
  const subject = `Bullsye alarm · ${input.displaySymbol} · ${input.kindLabel}`;

  try {
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to: input.to,
      subject,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#09090b;color:#e4e4e7;border-radius:12px">
          <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#34d399;margin:0 0 12px">Bullsye Alarm</p>
          <h1 style="font-size:20px;margin:0 0 8px;color:#fafafa">${input.displaySymbol}</h1>
          <p style="margin:0 0 4px;color:#a1a1aa">${input.kindLabel}</p>
          <p style="margin:0 0 20px;font-size:15px;color:#d4d4d8">${input.detail}</p>
          <a href="${link}" style="display:inline-block;background:#10b981;color:#052e1c;text-decoration:none;font-weight:700;font-size:13px;padding:10px 16px;border-radius:8px">Terminalde aç</a>
          <p style="margin:24px 0 0;font-size:11px;color:#71717a">Bu e-posta kayıtlı alarmınız tetiklendiği için gönderildi. Yatırım tavsiyesi değildir.</p>
        </div>
      `,
      text: `${input.displaySymbol} · ${input.kindLabel}\n${input.detail}\n\n${link}\n\nYatırım tavsiyesi değildir.`,
    });

    if (error) {
      console.error('Resend alert error:', error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'send failed';
    console.error('Resend alert exception:', e);
    return { ok: false, error: msg };
  }
}
