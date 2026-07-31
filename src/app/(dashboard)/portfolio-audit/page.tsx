'use client';

import { useMemo, useState } from 'react';
import { Activity, Lightbulb, Plus, Trash2 } from 'lucide-react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { PortfolioHealthCheck } from '@/components/dashboard/PortfolioHealthCheck';
import { authClient } from '@/lib/auth/client';
import { trackEvent } from '@/lib/analytics';
import { auditPortfolioWeights } from '@/lib/portfolio-audit';
import { cn } from '@/lib/utils';

type Row = { symbol: string; weight: number };

const SUGGESTIONS = ['THYAO', 'PGSUS', 'GARAN', 'ASELS', 'BTC', 'ETH', 'TUPRS'];

export default function PortfolioAuditPage() {
  const { data: session } = authClient.useSession();
  const { openAuth } = useAuthGate();
  const [rows, setRows] = useState<Row[]>([
    { symbol: 'THYAO', weight: 50 },
    { symbol: 'PGSUS', weight: 20 },
    { symbol: 'BTC', weight: 30 },
  ]);
  const [draft, setDraft] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  const report = useMemo(() => auditPortfolioWeights(rows), [rows]);
  const isAuthed = Boolean(session?.user);
  const showFull = isAuthed || unlocked;

  function addSymbol(sym: string) {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    setRows((prev) =>
      prev.some((r) => r.symbol === s)
        ? prev
        : [...prev, { symbol: s, weight: 20 }]
    );
    setDraft('');
  }

  function onGenerateReport() {
    trackEvent('portfolio_audit_report_clicked', {
      symbols: rows.length,
      authenticated: isAuthed,
    });
    if (isAuthed) {
      setUnlocked(true);
      trackEvent('portfolio_audit_unlocked', { health: report?.score });
      return;
    }
    openAuth({
      tab: 'register',
      feature: 'Portföy Sağlık Raporu',
      headline: 'Raporun hazır! Ücretsiz kayıt ol',
      subtitle:
        'Portföy analiz raporunu kaydet ve canlı takip et — 1 tıkla Google ile başla.',
    });
    // Soft preview for conversion
    setUnlocked(true);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Activity className="size-6 text-rose-400" />
          Portföy Sağlık & Risk Tarayıcısı
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Ağırlıkları gir — çeşitlendirme, temettü verimi ve sektörel riski anında
          gör
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex flex-wrap gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSymbol(draft);
              }
            }}
            placeholder="Sembol ekle (THYAO, BTC…)"
            className="min-w-[180px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
          />
          <button
            type="button"
            onClick={() => addSymbol(draft)}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-black hover:bg-emerald-400"
          >
            <Plus className="size-4" /> Ekle
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addSymbol(s)}
              className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[11px] text-[var(--muted)] hover:border-emerald-500/40 hover:text-emerald-400"
            >
              {s}
            </button>
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {rows.map((r) => (
            <li
              key={r.symbol}
              className="flex items-center gap-3 rounded-lg bg-[var(--surface)]/50 px-3 py-2"
            >
              <span className="w-16 font-semibold">{r.symbol}</span>
              <input
                type="range"
                min={5}
                max={80}
                value={r.weight}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((x) =>
                      x.symbol === r.symbol
                        ? { ...x, weight: Number(e.target.value) }
                        : x
                    )
                  )
                }
                className="flex-1"
              />
              <span className="w-10 text-right text-xs tabular-nums text-[var(--muted)]">
                %{r.weight}
              </span>
              <button
                type="button"
                onClick={() =>
                  setRows((prev) => prev.filter((x) => x.symbol !== r.symbol))
                }
                className="text-[var(--muted)] hover:text-rose-400"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {report ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ['Sağlık', report.score, 'text-emerald-400'],
              ['Çeşitlilik', report.diversification, 'text-cyan-400'],
              ['Risk', report.risk, 'text-amber-400'],
              ['Beta', report.betaIndex, 'text-violet-400'],
            ] as const
          ).map(([label, value, color]) => (
            <div
              key={label}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center"
            >
              <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                {label}
              </p>
              <p className={cn('mt-1 text-3xl font-black tabular-nums', color)}>
                {showFull ? value : '••'}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {report && showFull ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Tahmini yıllık temettü
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-400">
                %{report.estimatedYieldPct.toFixed(1)}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-[var(--muted)]">
                Sektör ağırlıkları
              </p>
              <ul className="space-y-1 text-sm">
                {report.sectorWeights.slice(0, 4).map((s) => (
                  <li key={s.sector} className="flex justify-between gap-2">
                    <span className="text-[var(--muted)]">{s.sector}</span>
                    <span className="tabular-nums font-medium">
                      %{s.weight.toFixed(0)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <PortfolioHealthCheck report={report} />

          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-200">
              <Lightbulb className="size-4" />
              Dinamik öneriler
            </p>
            <ul className="space-y-2 text-sm text-amber-100/90">
              {report.findings.map((f) => (
                <li key={f.id}>
                  {f.severity === 'critical' || f.severity === 'warn' ? '⚠️' : '💡'}{' '}
                  {f.message}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      <button
        type="button"
        onClick={onGenerateReport}
        className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:bg-emerald-400"
      >
        {isAuthed
          ? 'Raporu Yenile & Canlı Takip'
          : showFull
            ? 'Raporu Kaydet — Ücretsiz Kayıt Ol'
            : 'Raporu Gör — Ücretsiz Kayıt Ol & Kilidi Aç'}
      </button>
    </div>
  );
}
