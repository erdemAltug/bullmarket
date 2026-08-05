'use client';

import { computeAssetHealth, computeCryptoHealth, type AssetHealthReport } from '@/lib/health-score';
import { CommunitySentimentPoll } from '@/components/asset/CommunitySentimentPoll';
import { useFundamentals } from '@/hooks/useIntelligence';
import { useCompare } from '@/hooks/useIntelligence';
import { cn } from '@/lib/utils';

function scoreTone(score: number) {
  if (score >= 70) return 'emerald';
  if (score >= 45) return 'amber';
  return 'rose';
}

function RadialScore({ score, label }: { score: number; label: string }) {
  const tone = scoreTone(score);
  const color =
    tone === 'emerald'
      ? '#34d399'
      : tone === 'amber'
        ? '#fbbf24'
        : '#fb7185';

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative grid size-28 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${color} ${score * 3.6}deg, rgb(39 39 42) 0)`,
        }}
      >
        <div className="grid size-[5.5rem] place-items-center rounded-full bg-[var(--card)]">
          <div className="text-center">
            <p className="text-2xl font-black tabular-nums leading-none">
              {score}
            </p>
            <p className="text-[10px] text-[var(--muted)]">/ 100</p>
          </div>
        </div>
      </div>
      <p className="max-w-[12rem] text-center text-xs font-medium text-[var(--foreground)]">
        {label}
      </p>
    </div>
  );
}

function SubBars({ report }: { report: AssetHealthReport }) {
  return (
    <div className="space-y-3">
      {report.subs.map((s) => {
        const tone = scoreTone(s.score);
        return (
          <div key={s.key}>
            <div className="mb-1 flex justify-between gap-2 text-xs">
              <span className="shrink-0 text-[var(--muted)]">{s.label}</span>
              <span className="min-w-0 truncate text-right tabular-nums text-[var(--foreground)]">
                {s.score}
                <span className="text-[var(--muted)]"> · {s.takeaway}</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  tone === 'emerald' && 'bg-emerald-500',
                  tone === 'amber' && 'bg-amber-500',
                  tone === 'rose' && 'bg-rose-500'
                )}
                style={{ width: `${s.score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScorecardShell({
  title,
  report,
  loading,
  error,
  sentimentSymbol,
  changePercent,
}: {
  title: string;
  report: AssetHealthReport | null;
  loading?: boolean;
  error?: string | null;
  sentimentSymbol?: string;
  changePercent?: number;
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h2 className="mb-4 text-base font-semibold tracking-tight">{title}</h2>
      {loading ? (
        <p className="text-sm text-[var(--muted)]">Karne hesaplanıyor…</p>
      ) : error ? (
        <p className="text-sm text-rose-400">{error}</p>
      ) : report ? (
        <div className="space-y-5">
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <RadialScore score={report.overall} label={report.label} />
            <div className="space-y-4">
              <SubBars report={report} />
              <ul className="space-y-1.5 text-sm text-[var(--muted)]">
                {report.takeaways.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
          {sentimentSymbol ? (
            <CommunitySentimentPoll
              symbol={sentimentSymbol}
              changePercent={changePercent ?? 0}
              aiScore={report.overall}
              compact
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

/** BİST sembol sayfası — Yahoo fundamentals → 360° karne */
export function BistHealthScorecard({
  yahooSymbol,
  displaySymbol,
  changePercent = 0,
}: {
  yahooSymbol: string;
  displaySymbol?: string;
  changePercent?: number;
}) {
  const { data, isLoading, error } = useFundamentals(yahooSymbol);
  const report = data ? computeAssetHealth(data) : null;
  const sentimentSymbol =
    displaySymbol ?? yahooSymbol.replace(/\.IS$/i, '');

  return (
    <ScorecardShell
      title="Şirket Sağlık Karnesi"
      report={report}
      loading={isLoading}
      error={error?.message}
      sentimentSymbol={sentimentSymbol}
      changePercent={changePercent}
    />
  );
}

/** Kripto sembol — 1Y getiri + volatilite proxy */
export function CryptoHealthScorecard({
  symbol,
  changePercent,
  price,
  displaySymbol,
}: {
  symbol: string;
  changePercent: number;
  price: number;
  displaySymbol?: string;
}) {
  const pair = [symbol, symbol === 'BTCUSDT' ? 'ETHUSDT' : 'BTCUSDT'];
  const { data, isLoading, error } = useCompare(pair);
  const self = data?.items?.find((i) => i.symbol === symbol);
  const report = computeCryptoHealth({
    yearReturn: self?.yearReturn ?? null,
    changePercent,
    price,
  });

  return (
    <ScorecardShell
      title="Kripto Momentum & Risk Karnesi"
      report={isLoading && !self ? null : report}
      loading={isLoading && !self}
      error={error?.message}
      sentimentSymbol={displaySymbol ?? symbol.replace(/USDT$/i, '')}
      changePercent={changePercent}
    />
  );
}
