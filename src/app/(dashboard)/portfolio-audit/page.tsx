'use client';

import { useMemo, useState } from 'react';
import { Activity, Plus, Trash2 } from 'lucide-react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { authClient } from '@/lib/auth/client';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

type Row = { symbol: string; weight: number };

const SUGGESTIONS = ['THYAO', 'GARAN', 'ASELS', 'BTC', 'ETH', 'XU100'];

function scorePortfolio(rows: Row[]) {
  if (!rows.length) return null;
  const total = rows.reduce((s, r) => s + r.weight, 0) || 1;
  const herfindahl = rows.reduce((s, r) => {
    const w = r.weight / total;
    return s + w * w;
  }, 0);
  const diversification = Math.round((1 - herfindahl) * 100);
  const cryptoShare =
    rows
      .filter((r) => ['BTC', 'ETH', 'SOL', 'BNB'].includes(r.symbol.toUpperCase()))
      .reduce((s, r) => s + r.weight, 0) / total;
  const risk = Math.round(35 + cryptoShare * 40 + herfindahl * 25);
  const health = Math.max(0, Math.min(100, Math.round(diversification * 0.6 + (100 - risk) * 0.4)));
  return { diversification, risk: Math.min(100, risk), health };
}

export default function PortfolioAuditPage() {
  const { data: session } = authClient.useSession();
  const { openAuth } = useAuthGate();
  const [rows, setRows] = useState<Row[]>([
    { symbol: 'THYAO', weight: 40 },
    { symbol: 'BTC', weight: 25 },
  ]);
  const [draft, setDraft] = useState('');
  const preview = useMemo(() => scorePortfolio(rows), [rows]);

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
      authenticated: Boolean(session?.user),
    });
    if (session?.user) {
      trackEvent('portfolio_audit_unlocked', { health: preview?.health });
      return;
    }
    openAuth({
      tab: 'register',
      feature: 'Portföy Sağlık Raporu',
      headline: 'Raporun hazır! Ücretsiz kayıt ol',
      subtitle:
        'Portföy analiz raporunu kaydet ve canlı takip et — 1 tıkla Google ile başla.',
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Activity className="size-6 text-rose-400" />
          Portföy Sağlık Tarama
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Hisselerini / kriptolarını gir — risk & çeşitlendirme skorunu anında gör
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

      {preview ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ['Sağlık', preview.health, 'text-emerald-400'],
              ['Çeşitlilik', preview.diversification, 'text-cyan-400'],
              ['Risk', preview.risk, 'text-amber-400'],
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
                {session?.user ? value : '••'}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onGenerateReport}
        className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:bg-emerald-400"
      >
        {session?.user
          ? 'Raporu Kaydet & Canlı Takip Et'
          : 'Raporu Gör — Ücretsiz Kayıt Ol & Kilidi Aç'}
      </button>

      {session?.user && preview ? (
        <p className="text-center text-sm text-[var(--muted)]">
          Portföy sağlık skorun <strong className="text-emerald-400">{preview.health}</strong>.
          Risk yoğunluğu %{preview.risk}, çeşitlilik %{preview.diversification}.
        </p>
      ) : null}
    </div>
  );
}
