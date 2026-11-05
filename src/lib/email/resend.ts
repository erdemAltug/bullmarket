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

/** Owner notification for every Pro early-access lead (click or form). */
export async function sendProLeadEmail(input: {
  to: string;
  email: string;
  plan: string | null;
  features: string | null;
  source: string;
  kind: 'click' | 'form';
  signedIn: boolean;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { ok: false, skipped: true };
  const what = input.kind === 'click' ? 'Pro butonuna tıkladı' : 'Pro erken erişim formunu gönderdi';
  const rows = [
    ['E-posta', input.email],
    ['Ne yaptı', what],
    ['Plan', input.plan ?? '—'],
    ['İstediği özellikler', input.features ?? '—'],
    ['Nereden', input.source],
    ['Hesap', input.signedIn ? 'Giriş yapmış kullanıcı' : 'Misafir'],
  ];
  const html = `<div style="font-family:system-ui,sans-serif;font-size:14px;color:#111">
<h2 style="margin:0 0 12px">Yeni Pro talebi</h2>
<table style="border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td style="padding:4px 0"><b>${String(v).replace(/</g, '&lt;')}</b></td></tr>`
    )
    .join('')}</table>
<p style="margin-top:16px"><a href="mailto:${input.email}">${input.email} adresine yaz</a></p>
</div>`;
  try {
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to: input.to,
      replyTo: input.email,
      subject: `Yeni Pro talebi · ${input.email}${input.plan ? ` · ${input.plan}` : ''}`,
      html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'send failed' };
  }
}

/** Weekly portfolio check-up e-mail (one recipient per call). */
export async function sendPortfolioReportEmail(input: {
  to: string;
  unsubscribeUrl: string;
  report: import('@/lib/portfolio-report').PortfolioReport;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { ok: false, skipped: true };
  const r = input.report;
  const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const tl = (n: number) => `₺${n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;
  const pct = (n: number) => `${n >= 0 ? '+' : '−'}%${Math.abs(n).toLocaleString('tr-TR', { maximumFractionDigits: 1 })}`;
  const dot = { good: '#34d399', info: '#38bdf8', watch: '#fbbf24' } as const;
  const link = `${SITE_URL}/portfolio/rapor?utm_source=email&utm_medium=portfolio_report`;

  const findings = r.findings
    .map(
      (f) => `<tr><td style="padding:10px 0;border-top:1px solid #eee">
<div style="font-weight:600"><span style="display:inline-block;width:8px;height:8px;border-radius:4px;background:${dot[f.tone]};margin-right:8px"></span>${esc(f.title)}</div>
<div style="color:#555;margin-top:4px;line-height:1.5">${esc(f.body)}</div></td></tr>`
    )
    .join('');
  const holdings = r.holdings
    .slice(0, 6)
    .map(
      (h) => `<tr><td style="padding:6px 0">${esc(h.display)}</td>
<td style="padding:6px 0;text-align:right">%${(h.weight * 100).toFixed(1)}</td>
<td style="padding:6px 0;text-align:right;color:${h.pnlPct >= 0 ? '#059669' : '#e11d48'}">${pct(h.pnlPct)}</td></tr>`
    )
    .join('');

  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#111;font-size:14px">
<p style="color:#0d9488;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin:0">Bullsye · Portföy doktoru</p>
<h1 style="font-size:20px;margin:6px 0 16px">Haftalık portföy raporun</h1>
<table style="width:100%;border-collapse:collapse;margin-bottom:8px"><tr>
<td style="padding:10px;background:#f6f7f9;border-radius:8px"><div style="font-size:11px;color:#666">Toplam değer</div><div style="font-size:18px;font-weight:700">${tl(r.totalTry)}</div></td>
<td style="width:8px"></td>
<td style="padding:10px;background:#f6f7f9;border-radius:8px"><div style="font-size:11px;color:#666">Kâr / zarar</div><div style="font-size:18px;font-weight:700;color:${r.pnlPct >= 0 ? '#059669' : '#e11d48'}">${pct(r.pnlPct)}</div></td>
</tr></table>
<h2 style="font-size:15px;margin:20px 0 4px">Bu hafta öne çıkanlar</h2>
<table style="width:100%;border-collapse:collapse">${findings}</table>
<h2 style="font-size:15px;margin:20px 0 4px">En büyük pozisyonların</h2>
<table style="width:100%;border-collapse:collapse;font-size:13px">${holdings}</table>
<p style="margin:24px 0"><a href="${link}" style="background:#14b8a6;color:#042f2e;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700">Raporun tamamını aç</a></p>
<p style="color:#888;font-size:11px;line-height:1.5">Rapor senin girdiğin pozisyonlardan otomatik hazırlanır; yatırım tavsiyesi değildir.<br>Bu e-postayı almak istemiyorsan <a href="${input.unsubscribeUrl}" style="color:#888">buradan çık</a>.</p>
</div>`;

  try {
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to: input.to,
      subject: `Haftalık portföy raporun · ${tl(r.totalTry)} · ${pct(r.pnlPct)}`,
      html,
      headers: { 'List-Unsubscribe': `<${input.unsubscribeUrl}>` },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'send failed' };
  }
}
