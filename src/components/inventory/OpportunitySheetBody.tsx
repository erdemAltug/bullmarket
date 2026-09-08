import { ScoreCard } from '@/components/inventory/ScoreCard';
import { MatchCTA } from '@/components/inventory/MatchCTA';
import { cn, formatPercent } from '@/lib/utils';

type Consensus = {
  mean: number | null;
  high: number | null;
  low: number | null;
  upsidePct: number | null;
  price: number;
};

type OpportunitySheetBodyProps = {
  symbol: string;
  displaySymbol: string;
  score: number;
  reasons: { id: string; label: string }[];
  consensus: Consensus;
  onAdd: (input: { quantity: number; buyPrice: number }) => void;
  className?: string;
};

/** Arama sonucu — skor / konsensüs / lot; grafik ikincil. */
export function OpportunitySheetBody({
  symbol,
  displaySymbol,
  score,
  reasons,
  consensus,
  onAdd,
  className,
}: OpportunitySheetBodyProps) {
  const upside = consensus.upsidePct;
  const barPct =
    upside == null
      ? 40
      : Math.min(100, Math.max(6, 50 + Math.min(40, Math.max(-40, upside)) / 1.2));

  return (
    <div className={cn('space-y-4', className)}>
      <header className="pr-8">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          Fırsat karnesi
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          {displaySymbol}
        </h2>
      </header>

      <div className="grid gap-4">
        <ScoreCard symbol={displaySymbol} score={score} reasons={reasons} />

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
          <h3 className="text-sm font-semibold">12 aylık analist konsensüsü</h3>
          {consensus.mean != null ? (
            <>
              <p className="mt-3 text-2xl font-semibold tabular-nums">
                ₺
                {consensus.mean.toLocaleString('tr-TR', {
                  maximumFractionDigits: 2,
                })}
              </p>
              {upside != null ? (
                <p
                  className={cn(
                    'mt-1 text-sm font-semibold',
                    upside >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  )}
                >
                  Prim potansiyeli {formatPercent(upside)}
                </p>
              ) : null}
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-[10px] text-[var(--muted)]">
                  <span>Düşük</span>
                  <span>Ortalama</span>
                  <span>Yüksek</span>
                </div>
                <div className="relative h-2.5 overflow-hidden rounded-full bg-[var(--surface)]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-amber-400/90"
                    style={{ width: `${barPct}%` }}
                  />
                </div>
                {(consensus.low != null || consensus.high != null) && (
                  <div className="mt-1.5 flex justify-between font-mono text-[10px] text-[var(--muted)]">
                    <span>
                      {consensus.low != null
                        ? `₺${consensus.low.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`
                        : '—'}
                    </span>
                    <span>
                      {consensus.high != null
                        ? `₺${consensus.high.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`
                        : '—'}
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-3 text-[11px] text-[var(--muted)]">
                Kurum konsensüsü · yatırım tavsiyesi değildir
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted)]">
              Bu sembol için konsensüs şu an yok.
            </p>
          )}
        </div>

        <MatchCTA
          symbol={symbol}
          displaySymbol={displaySymbol}
          onAdd={onAdd}
        />
      </div>
    </div>
  );
}
