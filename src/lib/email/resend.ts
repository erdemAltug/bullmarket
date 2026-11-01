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

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type DigestEmailRow = {
  displaySymbol: string;
  name: string;
  score: number;
  changePercent: number;
  reason?: string;
  href: string;
};

function digestHtml(input: {
  dateLabel: string;
  headline?: string;
  rows: DigestEmailRow[];
  unsubscribeUrl: string;
}): string {
  const rows = input.rows
    .map((r) => {
      const up = r.changePercent >= 0;
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #27272a">
            <a href="${r.href}" style="color:#fafafa;text-decoration:none;font-weight:700">${esc(r.displaySymbol)}</a>
            <div style="font-size:12px;color:#71717a">${esc(r.reason || r.name)}</div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #27272a;text-align:right;font-size:13px;color:${up ? '#34d399' : '#fb7185'}">${up ? '+' : ''}${r.changePercent.toFixed(2)}%</td>
          <td style="padding:10px 0 10px 12px;border-bottom:1px solid #27272a;text-align:right;font-weight:700;color:#34d399">${r.score}</td>
        </tr>`;
    })
    .join('');

  return `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#09090b;color:#e4e4e7;border-radius:12px">
      <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#34d399;margin:0 0 4px">Bullsye · Sabah özeti</p>
      <p style="font-size:12px;color:#71717a;margin:0 0 16px">${esc(input.dateLabel)}</p>
      ${input.headline ? `<h1 style="font-size:18px;line-height:1.35;margin:0 0 16px;color:#fafafa">${esc(input.headline)}</h1>` : ''}
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:.08em">
          <td style="padding-bottom:6px">Sembol</td><td style="padding-bottom:6px;text-align:right">Gün</td><td style="padding-bottom:6px;text-align:right">Skor</td>
        </tr>
        ${rows}
      </table>
      <a href="${SITE_URL}/firsatlar?utm_source=email&utm_medium=digest" style="display:inline-block;margin-top:20px;background:#10b981;color:#052e1c;text-decoration:none;font-weight:700;font-size:13px;padding:10px 16px;border-radius:8px">Tüm taramayı aç</a>
      <p style="margin:24px 0 0;font-size:11px;color:#71717a">Skorlar canlı metriklerden hesaplanır; yatırım tavsiyesi değildir.<br><a href="${input.unsubscribeUrl}" style="color:#71717a">Sabah özetinden çık</a></p>
    </div>`;
}

/** Sends the morning digest in Resend batches of 100. */
export async function sendDigestEmails(input: {
  dateLabel: string;
  headline?: string;
  rows: DigestEmailRow[];
  recipients: { email: string; unsubscribeUrl: string }[];
}): Promise<{ sent: number; failed: number; skipped?: boolean }> {
  const resend = getResend();
  if (!resend) return { sent: 0, failed: 0, skipped: true };

  const subject = `Sabah özeti · ${input.rows
    .slice(0, 3)
    .map((r) => r.displaySymbol)
    .join(', ')}`;
  const text = [
    `Bullsye sabah özeti — ${input.dateLabel}`,
    ...input.rows.map(
      (r) => `${r.displaySymbol} skor ${r.score}/100 (${r.changePercent.toFixed(2)}%)`
    ),
    `${SITE_URL}/firsatlar`,
    'Yatırım tavsiyesi değildir.',
  ].join('\n');

  let sent = 0;
  let failed = 0;
  for (let i = 0; i < input.recipients.length; i += 100) {
    const chunk = input.recipients.slice(i, i + 100);
    try {
      const { error } = await resend.batch.send(
        chunk.map((r) => ({
          from: fromAddress(),
          to: r.email,
          subject,
          html: digestHtml({ ...input, unsubscribeUrl: r.unsubscribeUrl }),
          text: `${text}\n\nÇıkmak için: ${r.unsubscribeUrl}`,
          headers: { 'List-Unsubscribe': `<${r.unsubscribeUrl}>` },
        }))
      );
      if (error) {
        console.error('Resend digest batch error:', error);
        failed += chunk.length;
      } else {
        sent += chunk.length;
      }
    } catch (e) {
      console.error('Resend digest batch exception:', e);
      failed += chunk.length;
    }
  }
  return { sent, failed };
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
