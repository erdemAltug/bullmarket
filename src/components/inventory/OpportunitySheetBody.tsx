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

/** Arama sonucu — mum yerine 3 kart (P0 taslak gövde). */
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

  return (
    <div className={cn('space-y-4', className)}>
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          Fırsat karnesi · mum varsayılan kapalı
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          {displaySymbol}
        </h2>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
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
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                <div
                  className="h-full bg-amber-400/80"
                  style={{
                    width: `${Math.min(100, Math.max(8, 50 + (upside ?? 0) / 2))}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[var(--muted)]">
                Yatırım tavsiyesi değildir · kurum konsensüsü
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
