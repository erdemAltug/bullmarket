'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Loader2,
  Lightbulb,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { PortfolioHealthCheck } from '@/components/dashboard/PortfolioHealthCheck';
import { authClient } from '@/lib/auth/client';
import { trackEvent } from '@/lib/analytics';
import type { PortfolioAuditResult } from '@/lib/portfolio-audit';
import type { AssetMarket } from '@/lib/symbol-resolve';
import { cn } from '@/lib/utils';

type Row = {
  symbol: string;
  weight: number;
  yahoo?: string;
  market?: AssetMarket;
  name?: string;
};

type SearchHit = {
  symbol: string;
  yahoo: string;
  name: string;
  market: AssetMarket;
  exchange: string;
};

const QUICK = [
  { symbol: 'THYAO', yahoo: 'THYAO.IS', market: 'bist' as const },
  { symbol: 'GARAN', yahoo: 'GARAN.IS', market: 'bist' as const },
  { symbol: 'AAPL', yahoo: 'AAPL', market: 'us' as const },
  { symbol: 'NVDA', yahoo: 'NVDA', market: 'us' as const },
  { symbol: 'TSLA', yahoo: 'TSLA', market: 'us' as const },
  { symbol: 'BTC', yahoo: 'BTC-USD', market: 'crypto' as const },
  { symbol: 'ETH', yahoo: 'ETH-USD', market: 'crypto' as const },
];

const marketBadge: Record<AssetMarket, string> = {
  bist: 'BİST',
  us: 'NASDAQ',
  crypto: 'Kripto',
};

async function fetchSearch(q: string): Promise<SearchHit[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const json = (await res.json()) as {
    success: boolean;
    data?: SearchHit[];
  };
  return json.data ?? [];
}

async function fetchAudit(holdings: Row[]): Promise<PortfolioAuditResult> {
  const res = await fetch('/api/portfolio-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      holdings: holdings.map((h) => ({
        symbol: h.symbol,
        weight: h.weight,
        yahoo: h.yahoo,
        market: h.market,
        name: h.name,
      })),
    }),
  });
  const json = (await res.json()) as {
    success: boolean;
    data?: PortfolioAuditResult;
    error?: string;
  };
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Audit failed');
  }
  return json.data;
}

export default function PortfolioAuditPage() {
  const { data: session } = authClient.useSession();
  const { openAuth } = useAuthGate();
  const [rows, setRows] = useState<Row[]>([
    { symbol: 'THYAO', weight: 35, yahoo: 'THYAO.IS', market: 'bist' },
    { symbol: 'AAPL', weight: 25, yahoo: 'AAPL', market: 'us' },
    { symbol: 'BTC', weight: 20, yahoo: 'BTC-USD', market: 'crypto' },
    { symbol: 'NVDA', weight: 20, yahoo: 'NVDA', market: 'us' },
  ]);
  const [draft, setDraft] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(draft.trim()), 280);
    return () => window.clearTimeout(t);
  }, [draft]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const searchQuery = useQuery({
    queryKey: ['symbol-search', debounced],
    queryFn: () => fetchSearch(debounced),
    enabled: open,
    staleTime: 60_000,
  });

  const holdingsKey = useMemo(
    () =>
      rows
        .map((r) => `${r.symbol}:${r.weight}:${r.yahoo ?? ''}:${r.market ?? ''}`)
        .join('|'),
    [rows]
  );

  const auditQuery = useQuery({
    queryKey: ['portfolio-audit-live', holdingsKey],
    queryFn: () => fetchAudit(rows),
    enabled: rows.length > 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const report = auditQuery.data ?? null;
  const isAuthed = Boolean(session?.user);
  const showFull = isAuthed || unlocked;

  const addHit = useCallback((hit: SearchHit) => {
    setRows((prev) =>
      prev.some((r) => r.symbol.toUpperCase() === hit.symbol.toUpperCase())
        ? prev
        : [
            ...prev,
            {
              symbol: hit.symbol.toUpperCase(),
              weight: 20,
              yahoo: hit.yahoo,
              market: hit.market,
              name: hit.name,
            },
          ]
    );
    setDraft('');
    setOpen(false);
  }, []);

  async function addFromDraft() {
    const q = draft.trim();
    if (!q) return;
    const hits =
      searchQuery.data?.length && debounced.toUpperCase() === q.toUpperCase()
        ? searchQuery.data
        : await fetchSearch(q);
    const exact =
      hits.find((h) => h.symbol.toUpperCase() === q.toUpperCase()) ?? hits[0];
    if (exact) {
      addHit(exact);
      return;
    }
    // Last resort: treat as US ticker (Yahoo will validate on audit)
    addHit({
      symbol: q.toUpperCase(),
      yahoo: q.toUpperCase(),
      name: q.toUpperCase(),
      market: 'us',
      exchange: 'Yahoo',
    });
  }

  function onGenerateReport() {
    trackEvent('portfolio_audit_report_clicked', {
      symbols: rows.length,
      authenticated: isAuthed,
      live: Boolean(report?.live),
    });
    if (isAuthed) {
      setUnlocked(true);
      void auditQuery.refetch();
      trackEvent('portfolio_audit_unlocked', { health: report?.score });
      return;
    }
    openAuth({
      tab: 'register',
      feature: 'Portföy Sağlık Raporu',
      headline: 'Raporun hazır! Ücretsiz kayıt ol',
      subtitle:
        'Canlı Yahoo + Binance portföy analizini kaydet — 1 tıkla Google ile başla.',
    });
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
          Canlı Yahoo (BİST + NASDAQ) ve Binance verisi — beta, temettü, sektör ve
          fiyat gerçek API&apos;den
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div ref={boxRef} className="relative">
          <div className="flex flex-wrap gap-2">
            <input
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void addFromDraft();
                }
                if (e.key === 'Escape') setOpen(false);
              }}
              placeholder="Ara: THYAO, AAPL, TPIC, NVDA, BTC…"
              className="min-w-[180px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => void addFromDraft()}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-black hover:bg-emerald-400"
            >
              <Plus className="size-4" /> Ekle
            </button>
          </div>

          {open ? (
            <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-xl">
              {searchQuery.isFetching ? (
                <li className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--muted)]">
                  <Loader2 className="size-3.5 animate-spin" />
                  Yahoo araması…
                </li>
              ) : null}
              {(searchQuery.data ?? []).map((hit) => (
                <li key={`${hit.market}-${hit.yahoo}`}>
                  <button
                    type="button"
                    onClick={() => addHit(hit)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-emerald-500/10"
                  >
                    <span>
                      <span className="font-semibold">{hit.symbol}</span>
                      <span className="ml-2 text-xs text-[var(--muted)]">
                        {hit.name}
                      </span>
                    </span>
                    <span className="shrink-0 rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] uppercase text-[var(--muted)]">
                      {hit.exchange || marketBadge[hit.market]}
                    </span>
                  </button>
                </li>
              ))}
              {!searchQuery.isFetching &&
              (searchQuery.data?.length ?? 0) === 0 ? (
                <li className="px-3 py-2 text-xs text-[var(--muted)]">
                  Sonuç yok — sembolü yazıp Enter ile dene
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {QUICK.map((s) => (
            <button
              key={s.symbol}
              type="button"
              onClick={() =>
                addHit({
                  symbol: s.symbol,
                  yahoo: s.yahoo,
                  name: s.symbol,
                  market: s.market,
                  exchange: marketBadge[s.market],
                })
              }
              className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[11px] text-[var(--muted)] hover:border-emerald-500/40 hover:text-emerald-400"
            >
              {s.symbol}
            </button>
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {rows.map((r) => {
            const live = report?.holdings?.find(
              (h) => h.display.toUpperCase() === r.symbol.toUpperCase()
            );
            return (
              <li
                key={r.symbol}
                className="flex flex-wrap items-center gap-3 rounded-lg bg-[var(--surface)]/50 px-3 py-2"
              >
                <div className="min-w-[7rem]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">{r.symbol}</span>
                    <span className="text-[10px] uppercase text-[var(--muted)]">
                      {marketBadge[r.market ?? live?.market ?? 'us']}
                    </span>
                  </div>
                  {live?.price != null ? (
                    <p className="text-[11px] tabular-nums text-[var(--muted)]">
                      {live.currency === 'USD' || live.currency === 'USDT'
                        ? '$'
                        : live.currency === 'TRY'
                          ? '₺'
                          : ''}
                      {live.price.toLocaleString('tr-TR', {
                        maximumFractionDigits: 2,
                      })}
                      {live.beta != null ? ` · β ${live.beta.toFixed(2)}` : ''}
                      {live.dividendYieldPct
                        ? ` · %${live.dividendYieldPct.toFixed(1)}`
                        : ''}
                    </p>
                  ) : live && !live.ok ? (
                    <p className="text-[11px] text-amber-400">Veri yok</p>
                  ) : (
                    <p className="text-[11px] text-[var(--muted)]">
                      {r.name ?? '…'}
                    </p>
                  )}
                </div>
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
                  className="min-w-[120px] flex-1"
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
            );
          })}
        </ul>

        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
          {auditQuery.isFetching ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              Canlı metrikler çekiliyor (Yahoo / Binance)…
            </>
          ) : report?.live ? (
            <>● Canlı veri — beta & temettü Yahoo, kripto Binance</>
          ) : auditQuery.isError ? (
            <span className="text-amber-400">
              Canlı audit hatası — tekrar deneyin
            </span>
          ) : null}
        </p>
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
                Tahmini yıllık temettü (Yahoo)
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-400">
                %{report.estimatedYieldPct.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-[var(--muted)]">
                Sektör ağırlıkları (canlı)
              </p>
              <ul className="space-y-1 text-sm">
                {report.sectorWeights.slice(0, 5).map((s) => (
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
          ? 'Raporu Yenile (Canlı API)'
          : showFull
            ? 'Raporu Kaydet — Ücretsiz Kayıt Ol'
            : 'Raporu Gör — Ücretsiz Kayıt Ol & Kilidi Aç'}
      </button>
    </div>
  );
}
