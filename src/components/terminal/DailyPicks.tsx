'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, Crown, Flame, Gem, Lock, Rocket, Star, Target, TrendingDown, Undo2 } from 'lucide-react';
import { useProRequest } from '@/components/pro/ProRequest';
import { usePlan } from '@/hooks/usePlan';
import { useTargets } from '@/hooks/useTargets';
import { MARKETS, THEMES, THEME_ORDER, buildPicks, marketOf, pickTheme, type PickMarket, type PickTheme } from '@/lib/picks';
import { assetDetailHref } from '@/lib/seo/internal-links';
import type { ScannerItem } from '@/types/scanner';
import { cn } from '@/lib/utils';
import { targetFromScanner, useChartClick } from './QuickChart';

const ICONS: Record<PickTheme, typeof Flame> = {
  best: Flame,
  upside: Target,
  favorites: Star,
  cheap: Gem,
  pullback: TrendingDown,
  momentum: Rocket,
  rebound: Undo2,
  volume: Activity,
};

const FREE_VISIBLE = 3;
const PAID_VISIBLE = 12;

function money(v: number, cur: 'TRY' | 'USD') {
  return `${cur === 'USD' ? '$' : '₺'}${v.toLocaleString('tr-TR', { maximumFractionDigits: v >= 100 ? 1 : v >= 1 ? 2 : 4 })}`;
}

function Ring({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const tone = v >= 75 ? '#34d399' : v >= 55 ? '#14b8a6' : '#fbbf24';
  return (
    <div
      className="grid size-12 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(${tone} ${v * 3.6}deg, rgba(148,163,184,.15) 0)` }}
      title="Bullsye skoru"
    >
      <div className="grid size-9 place-items-center rounded-full bg-[var(--card)] font-mono text-sm font-bold">{v}</div>
    </div>
  );
}

/**
 * The heart of the terminal: ready-made, explained shortlists across markets.
 * Each card says in a few words why it stands out. Observations, not orders.
 */
export function DailyPicks({ items, loading }: { items: ScannerItem[]; loading?: boolean }) {
  const [market, setMarket] = useState<PickMarket>('BIST');
  const [theme, setTheme] = useState<PickTheme>('best');
  const { isPaid, plan } = usePlan();
  const { openPro } = useProRequest();
  const chartClick = useChartClick();
  const targets = useTargets();

  const all = useMemo(() => buildPicks(items, targets.data ?? []), [items, targets.data]);
  const themes = THEME_ORDER.filter((t) => THEMES[t].markets.includes(market));
  const activeTheme = themes.includes(theme) ? theme : 'best';
  const counts = useMemo(() => {
    const inMarket = all.filter((p) => marketOf(p.item) === market);
    return Object.fromEntries(themes.map((t) => [t, pickTheme(t, inMarket).length])) as Record<PickTheme, number>;
  }, [all, market, themes]);
  const list = useMemo(
    () => pickTheme(activeTheme, all.filter((p) => marketOf(p.item) === market)),
    [activeTheme, all, market]
  );
  const visible = isPaid ? PAID_VISIBLE : FREE_VISIBLE;
  // Free: 3 open + 3 locked teasers, not a wall of blur.
  const shown = list.slice(0, isPaid ? PAID_VISIBLE : FREE_VISIBLE * 2);

  return (
    <section className="rounded-2xl border border-[var(--accent)]/25 bg-gradient-to-b from-[var(--accent)]/[0.06] to-[var(--card)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            Bugün bakmaya değer
            {isPaid ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                <Crown className="size-3" /> {plan === 'elite' ? 'Elite' : 'Pro'}
              </span>
            ) : null}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{THEMES[activeTheme].hint}</p>
        </div>
        <div className="inline-flex rounded-lg border border-[var(--border)] p-0.5 text-xs">
          {MARKETS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMarket(m.id)}
              className={cn(
                'rounded-md px-3 py-1 font-semibold',
                market === m.id ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {themes.map((id) => {
          const Icon = ICONS[id];
          const n = counts[id] ?? 0;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTheme(id)}
              disabled={!n && !loading}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40',
                activeTheme === id
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-[#042f2e]'
                  : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]'
              )}
            >
              <Icon className="size-3.5" /> {THEMES[id].label}
              <span className={cn('font-mono text-[10px]', activeTheme === id ? 'opacity-70' : 'opacity-60')}>{n}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {loading && !shown.length
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[132px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
            ))
          : shown.map((p, idx) => {
              const locked = idx >= visible;
              // Locked cards render placeholders so the names aren't in the page.
              const sym = locked ? '•••••' : p.item.displaySymbol;
              const name = locked ? 'Pro üyelere açık' : p.item.name;
              const reasons = locked ? ['••••••••', '••••••'] : p.reasons;
              const href = assetDetailHref(p.item.symbol, p.item.category);
              const up = p.item.changePercent >= 0;
              const card = (
                <div
                  className={cn(
                    'group relative flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5 transition-colors',
                    !locked && 'hover:border-[var(--accent)]/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Ring value={p.score} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <b className="truncate text-base group-hover:text-[var(--accent)]">{sym}</b>
                        <span className={cn('font-mono text-xs font-semibold', up ? 'text-emerald-400' : 'text-rose-400')}>
                          {locked ? '••' : `${up ? '+' : ''}${p.item.changePercent.toFixed(2)}%`}
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-[var(--muted)]">{name}</p>
                      <p className="mt-0.5 font-mono text-sm tabular-nums">
                        {locked ? '••,••' : money(p.item.price, p.item.currency)}
                        {!locked && p.target != null && p.analysts >= 3 ? (
                          <span className="ml-2 text-[11px] text-[var(--muted)]">hedef {money(p.target, p.item.currency)}</span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {reasons.map((r) => (
                      <span key={r} className="rounded-md bg-[var(--accent)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
                        {r}
                      </span>
                    ))}
                  </div>
                  {locked ? (
                    <div className="absolute inset-0 grid place-items-center rounded-xl bg-[var(--card)]/70 backdrop-blur-[6px]">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                        <Lock className="size-3.5" /> Pro ile aç
                      </span>
                    </div>
                  ) : null}
                </div>
              );
              return locked ? (
                <button key={`locked-${idx}`} type="button" onClick={() => openPro('daily-picks')} className="text-left">
                  {card}
                </button>
              ) : (
                <Link key={p.item.symbol} href={href ?? '/firsatlar'} onClick={chartClick(targetFromScanner(p.item, href))} className="block">
                  {card}
                </Link>
              );
            })}
        {!loading && !shown.length ? (
          <p className="col-span-full rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">
            Bugün bu kritere uyan varlık yok. Başka bir sekmeye bak.
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--muted)]">
        <span>Otomatik tarama sonucudur, yatırım tavsiyesi değildir. Karar vermeden önce grafiğe ve detaya bak.</span>
        {!isPaid && list.length > FREE_VISIBLE ? (
          <button type="button" onClick={() => openPro('daily-picks')} className="font-semibold text-amber-300 hover:underline">
            Tüm listeyi Pro ile gör ({Math.min(list.length, PAID_VISIBLE)}) →
          </button>
        ) : (
          <Link href="/firsatlar" className="font-semibold text-[var(--accent)] hover:underline">
            Tüm skor taraması →
          </Link>
        )}
      </div>
    </section>
  );
}
