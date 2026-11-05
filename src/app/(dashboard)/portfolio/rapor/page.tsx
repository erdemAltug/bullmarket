import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import { isDatabaseConfigured } from '@/db';
import { ReportEmailToggle } from '@/components/portfolio/ReportEmailToggle';
import { getCurrentUserId } from '@/lib/auth-user';
import { buildPortfolioReport, type ReportTone } from '@/lib/portfolio-report';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Portföy doktoru raporu',
  robots: { index: false, follow: false },
};

function tl(n: number) {
  return `₺${n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;
}
function pct(n: number, digits = 1) {
  return `${n >= 0 ? '+' : '−'}%${Math.abs(n).toLocaleString('tr-TR', { maximumFractionDigits: digits })}`;
}
const TONE: Record<ReportTone, string> = {
  good: 'border-emerald-500/30 bg-emerald-500/5',
  info: 'border-[var(--border)] bg-[var(--card)]',
  watch: 'border-amber-500/30 bg-amber-500/5',
};
const TONE_DOT: Record<ReportTone, string> = {
  good: 'bg-emerald-400',
  info: 'bg-sky-400',
  watch: 'bg-amber-400',
};

function Bars({ rows }: { rows: { label: string; weight: number }[] }) {
  return (
    <ul className="space-y-2">
      {rows.slice(0, 6).map((r) => (
        <li key={r.label}>
          <div className="flex justify-between text-xs">
            <span>{r.label}</span>
            <span className="font-mono tabular-nums text-[var(--muted)]">%{(r.weight * 100).toFixed(0)}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.max(2, r.weight * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function PortfolioReportPage() {
  const userId = await getCurrentUserId();
  const report = isDatabaseConfigured() ? await buildPortfolioReport(userId).catch(() => null) : null;
  const date = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/portfolio" className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
        <ArrowLeft className="size-3.5" /> Portföy
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            <Stethoscope className="size-3.5" /> Portföy doktoru · Pro önizleme
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Haftalık portföy raporu</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{date} · açık beta boyunca ücretsiz</p>
        </div>
        <ReportEmailToggle />
      </header>

      {!report ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
          <p className="text-sm font-medium">Rapor için portföyünde en az bir pozisyon olmalı.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Hisse, kripto, altın, nakit veya mevduat ekle; raporun bir sonraki açılışta hazır olur.
          </p>
          <Link href="/portfolio" className="mt-4 inline-block rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-bold text-black">
            Portföyüne pozisyon ekle
          </Link>
        </div>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-4">
            {[
              ['Toplam değer', tl(report.totalTry), null],
              ['Kâr / zarar', tl(report.pnlTry), report.pnlPct],
              ['En büyük pozisyon', `%${(report.topWeight * 100).toFixed(0)}`, null],
              [
                'Analist hedefine göre',
                report.weightedTargetUpsidePct == null ? '—' : pct(report.weightedTargetUpsidePct),
                null,
              ],
            ].map(([label, value, change]) => (
              <div key={label as string} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{label}</p>
                <p className="mt-1 font-mono text-xl font-bold tabular-nums">{value}</p>
                {typeof change === 'number' ? (
                  <p className={cn('font-mono text-xs', change >= 0 ? 'text-emerald-400' : 'text-rose-400')}>{pct(change)}</p>
                ) : null}
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">Bu hafta öne çıkanlar</h2>
            {report.findings.map((f) => (
              <div key={f.title} className={cn('rounded-xl border p-4', TONE[f.tone])}>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <span className={cn('size-2 rounded-full', TONE_DOT[f.tone])} /> {f.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{f.body}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
              <h3 className="mb-3 text-sm font-semibold">Varlık dağılımı</h3>
              <Bars rows={report.byClass} />
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
              <h3 className="mb-3 text-sm font-semibold">Sektör dağılımı</h3>
              <Bars rows={report.bySector} />
            </div>
          </section>

          <section className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[11px] uppercase tracking-wide text-[var(--muted)]">
                  <th className="px-4 py-3 font-medium">Varlık</th>
                  <th className="px-4 py-3 text-right font-medium">Değer</th>
                  <th className="px-4 py-3 text-right font-medium">Ağırlık</th>
                  <th className="px-4 py-3 text-right font-medium">K/Z</th>
                  <th className="px-4 py-3 text-right font-medium">Skor (7g)</th>
                  <th className="px-4 py-3 text-right font-medium">Hedefe</th>
                </tr>
              </thead>
              <tbody>
                {report.holdings.map((h) => (
                  <tr key={`${h.assetClass}:${h.symbol}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-2.5">
                      <span className="font-semibold">{h.display}</span>
                      <span className="ml-2 text-xs text-[var(--muted)]">{h.sector}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">{tl(h.valueTry)}</td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">%{(h.weight * 100).toFixed(1)}</td>
                    <td className={cn('px-4 py-2.5 text-right font-mono tabular-nums', h.pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                      {pct(h.pnlPct)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {h.score ?? '—'}
                      {h.scoreChange7d ? (
                        <span className={cn('ml-1 text-[11px]', h.scoreChange7d > 0 ? 'text-emerald-400' : 'text-rose-400')}>
                          ({h.scoreChange7d > 0 ? '+' : ''}
                          {h.scoreChange7d})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {h.targetUpsidePct == null ? '—' : pct(h.targetUpsidePct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <p className="text-xs text-[var(--muted)]">
            Rapor senin girdiğin pozisyonlardan ve güncel piyasa verilerinden otomatik hazırlanır. Gözlem
            niteliğindedir; yatırım tavsiyesi değildir.
          </p>
        </>
      )}
    </div>
  );
}
