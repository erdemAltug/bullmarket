'use client';

import { useMemo } from 'react';
import { Newspaper } from 'lucide-react';
import { useTargets } from '@/hooks/useTargets';
import { buildPicks, marketOf, pickTheme, type Pick, type PickMarket } from '@/lib/picks';
import type { ScannerItem } from '@/types/scanner';
import { cn } from '@/lib/utils';
import { targetFromScanner, useQuickChart } from './QuickChart';

const LABEL: Record<Exclude<PickMarket, 'FUND'>, string> = { BIST: 'Borsa İstanbul', US: 'ABD borsaları', CRYPTO: 'Kripto' };

function pct(n: number) {
  return `${n >= 0 ? '+' : '−'}%${Math.abs(n).toFixed(2).replace('.', ',')}`;
}

type Brief = {
  market: Exclude<PickMarket, 'FUND'>;
  avg: number;
  up: number;
  down: number;
  lines: string[];
  mentions: Pick[];
};

function writeBrief(market: Brief['market'], picks: Pick[]): Brief | null {
  const list = picks.filter((p) => marketOf(p.item) === market);
  if (list.length < 5) return null;
  const up = list.filter((p) => p.item.changePercent > 0).length;
  const down = list.filter((p) => p.item.changePercent < 0).length;
  const avg = list.reduce((a, p) => a + p.item.changePercent, 0) / list.length;
  const share = up / Math.max(1, up + down);

  const mood =
    share >= 0.65 ? 'Alıcılı bir gün' : share <= 0.35 ? 'Satıcılı bir gün' : 'Kararsız, karışık bir gün';
  const lines: string[] = [
    `${mood}: ${list.length} varlıktan ${up} yükselen, ${down} düşen var; ortalama hareket ${pct(avg)}.`,
  ];

  const leaders = [...list].sort((a, b) => b.item.changePercent - a.item.changePercent).slice(0, 2);
  const laggard = [...list].sort((a, b) => a.item.changePercent - b.item.changePercent)[0];
  lines.push(
    `Günü ${leaders.map((p) => `${p.item.displaySymbol} (${pct(p.item.changePercent)})`).join(' ve ')} sürükledi; ${laggard.item.displaySymbol} ${pct(laggard.item.changePercent)} ile en zayıf kaldı.`
  );

  const best = pickTheme('best', list)[0];
  const mentions: Pick[] = [...leaders];
  if (best) {
    mentions.push(best);
    const why = best.reasons.slice(0, 2).join(', ').toLocaleLowerCase('tr-TR');
    lines.push(`Skor tablosunda öne çıkan ${best.item.displaySymbol} oldu (${best.score} puan${why ? `; ${why}` : ''}).`);
  }
  if (market !== 'CRYPTO') {
    const pull = pickTheme('pullback', list)[0];
    if (pull) {
      mentions.push(pull);
      lines.push(
        `${pull.item.displaySymbol} bugün ${pct(pull.item.changePercent)} geriledi ama analist ortalama hedefine hâlâ %${pull.upside!.toFixed(0)} uzakta.`
      );
    }
  } else {
    const reb = pickTheme('rebound', list)[0];
    if (reb) {
      mentions.push(reb);
      lines.push(`${reb.item.displaySymbol} gün içi dipten toparlanarak aralığının üst kısmına yükseldi.`);
    }
  }
  return { market, avg, up, down, lines, mentions };
}

/** One auto-written paragraph per market: what happened and what stood out. */
export function MarketBriefs({ items }: { items: ScannerItem[] }) {
  const targets = useTargets();
  const openChart = useQuickChart();
  const briefs = useMemo(() => {
    const picks = buildPicks(items, targets.data ?? []);
    return (['BIST', 'US', 'CRYPTO'] as const).map((m) => writeBrief(m, picks)).filter((b): b is Brief => b != null);
  }, [items, targets.data]);

  if (!briefs.length) return null;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="inline-flex items-center gap-2 text-base font-semibold">
        <Newspaper className="size-4 text-[var(--accent)]" /> Günün piyasa yorumu
      </h2>
      <p className="text-xs text-[var(--muted)]">Canlı verilerden otomatik yazılır, her dakika güncellenir</p>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {briefs.map((b) => (
          <article key={b.market} className="flex flex-col rounded-xl border border-[var(--border)] p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">{LABEL[b.market]}</h3>
              <span className={cn('font-mono text-sm font-bold', b.avg >= 0 ? 'text-emerald-400' : 'text-rose-400')}>{pct(b.avg)}</span>
            </div>
            <div className="mt-2 space-y-2 text-[13px] leading-relaxed text-[var(--foreground)]/85">
              {b.lines.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
              {Array.from(new Map(b.mentions.map((p) => [p.item.symbol, p])).values()).map((p) => (
                <button
                  key={p.item.symbol}
                  type="button"
                  onClick={() => openChart?.(targetFromScanner(p.item))}
                  className="rounded-md border border-[var(--border)] px-2 py-0.5 text-[11px] font-semibold hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
                >
                  {p.item.displaySymbol} ↗
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
