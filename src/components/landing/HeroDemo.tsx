'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BellRing, Mail, Sparkles } from 'lucide-react';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { useChartHistory } from '@/hooks/useMarketData';
import { buildPotentialCards, type PotentialCard } from '@/lib/ai-opportunity';
import { cn, formatPercent } from '@/lib/utils';

const CYCLE_MS = 7000;
const W = 520;
const H = 190;

function historySource(card: PotentialCard): { symbol: string; source: 'yahoo' | 'binance' | 'tefas' } {
  if (card.category === 'CRYPTO') {
    const s = card.symbol.toUpperCase();
    return { symbol: s.endsWith('USDT') ? s : `${s}USDT`, source: 'binance' };
  }
  if (card.category === 'FON') return { symbol: card.displaySymbol, source: 'tefas' };
  return { symbol: card.symbol, source: 'yahoo' };
}

function money(v: number, currency: 'TRY' | 'USD') {
  return `${currency === 'USD' ? '$' : '₺'}${v.toLocaleString('tr-TR', {
    maximumFractionDigits: v >= 100 ? 2 : 4,
  })}`;
}

/** Path for a real close series, scaled into the demo frame. */
function buildPath(prices: number[]) {
  if (prices.length < 2) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const pts = prices.map((p, i) => [
    (i / (prices.length - 1)) * W,
    H - 14 - ((p - min) / span) * (H - 34),
  ]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return { line, area: `${line} L${W},${H} L0,${H} Z`, last };
}

function useCountUp(target: number, key: string, ms = 1100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, key, ms]);
  return value;
}

function useTypewriter(text: string, key: string, speed = 18) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, key, speed]);
  return text.slice(0, n);
}

function ScoreRing({ score, k }: { score: number; k: string }) {
  const shown = useCountUp(score, k);
  const r = 38;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-[104px] shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
          style={{ filter: 'drop-shadow(0 0 6px rgba(20,184,166,0.55))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-bold tabular-nums">{shown}</span>
        <span className="text-[9px] uppercase tracking-widest text-[var(--muted)]">skor</span>
      </div>
    </div>
  );
}

function FactorBar({ label, value, k, delay }: { label: string; value: number; k: string; delay: number }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-[var(--muted)]">
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(value)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
        <div
          key={k}
          className="landing-bar h-full rounded-full bg-gradient-to-r from-[var(--accent)]/60 to-[var(--accent)]"
          style={{ width: `${Math.max(6, Math.min(100, value))}%`, animationDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

function factorsFor(card: PotentialCard) {
  const momentum = 50 + Math.max(-50, Math.min(50, card.changePercent * 8));
  const band =
    card.dayHigh && card.dayLow && card.dayHigh > card.dayLow
      ? ((card.price - card.dayLow) / (card.dayHigh - card.dayLow)) * 100
      : 55;
  const value =
    card.trailingPE && card.trailingPE > 0 ? Math.max(10, Math.min(95, 100 - card.trailingPE * 3)) : 50;
  return [
    { label: 'Momentum', value: momentum },
    { label: 'Gün içi bant', value: band },
    { label: 'Değerleme', value },
  ];
}

export function HeroDemo() {
  const { data } = useMarketScanner();
  const picks = useMemo(() => {
    const ranked = buildPotentialCards(data ?? [], 30);
    const bist = ranked.filter((c) => c.category === 'BIST');
    const other = ranked.filter((c) => c.category === 'US' || c.category === 'CRYPTO');
    // Alphabetical so a 15s quote refresh that reshuffles scores doesn't move
    // the tab you're looking at.
    return [...bist.slice(0, 2), ...other.slice(0, 1)].sort((a, b) =>
      a.displaySymbol.localeCompare(b.displaySymbol)
    );
  }, [data]);

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || picks.length < 2) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % picks.length), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [paused, picks.length]);

  const card = picks[idx % Math.max(1, picks.length)];
  const k = card ? `${card.symbol}-${idx}` : 'none';

  const hs = card ? historySource(card) : null;
  const { data: hist } = useChartHistory(hs?.symbol, '1M', hs?.source ?? 'yahoo');
  const path = useMemo(() => {
    const pts = hist?.points ?? [];
    return buildPath(pts.map((p) => p.price).filter((p) => p > 0));
  }, [hist]);

  const summary = card
    ? `${card.displaySymbol}: ${card.catalysts.slice(0, 2).join(' · ') || 'Skor, fiyat hareketi ve hacimden hesaplandı'}.`
    : '';
  const typed = useTypewriter(summary, k);
  const up = (card?.changePercent ?? 0) >= 0;

  return (
    <div
      className="landing-fade-up landing-delay-4 relative mx-auto mt-12 w-full max-w-4xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 rounded-[40px] opacity-70 blur-3xl"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(20,184,166,0.22), transparent 65%)' }}
      />
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 shadow-2xl shadow-black/40 backdrop-blur">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-rose-400/70" />
          <span className="size-2.5 rounded-full bg-amber-400/70" />
          <span className="size-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-3 rounded-md bg-[var(--background)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--muted)]">
            bullsye.app/terminal
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--accent)] opacity-70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[var(--accent)]" />
            </span>
            canlı
          </span>
        </div>

        {/* symbol tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-[var(--border)] px-3 py-2">
          {(picks.length ? picks : [null, null, null]).map((p, i) => (
            <button
              key={p?.symbol ?? i}
              type="button"
              disabled={!p}
              onClick={() => setIdx(i)}
              className={cn(
                'relative shrink-0 overflow-hidden rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                i === idx ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              {p ? p.displaySymbol : <span className="inline-block h-3 w-10 animate-pulse rounded bg-[var(--border)]" />}
              {i === idx && p && !paused ? (
                <span
                  key={k}
                  className="landing-progress absolute bottom-0 left-0 h-0.5 bg-[var(--accent)]"
                  style={{ animationDuration: `${CYCLE_MS}ms` }}
                />
              ) : null}
            </button>
          ))}
          <span className="ml-auto hidden self-center text-[10px] text-[var(--muted)] sm:block">
            Bugünün en yüksek skorları
          </span>
        </div>

        <div className="grid gap-0 md:grid-cols-[1.45fr_1fr]">
          {/* chart */}
          <div className="relative border-b border-[var(--border)] p-4 md:border-b-0 md:border-r">
            {card ? (
              <div className="flex items-baseline gap-3">
                <span className="text-lg font-bold">{card.displaySymbol}</span>
                <span className="truncate text-xs text-[var(--muted)]">{card.name}</span>
              </div>
            ) : (
              <div className="h-6 w-40 animate-pulse rounded bg-[var(--border)]" />
            )}
            {card ? (
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold tabular-nums">{money(card.price, card.currency)}</span>
                <span className={cn('font-mono text-sm font-semibold', up ? 'text-emerald-400' : 'text-rose-400')}>
                  {formatPercent(card.changePercent)}
                </span>
                <span className="text-[10px] text-[var(--muted)]">· 1 ay</span>
              </div>
            ) : null}
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-[170px] w-full sm:h-[190px]" preserveAspectRatio="none">
              <defs>
                <linearGradient id="hd-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgb(20,184,166)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="rgb(20,184,166)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgba(148,163,184,0.10)" strokeDasharray="3 5" />
              ))}
              {path ? (
                <g key={k}>
                  <path d={path.area} fill="url(#hd-fill)" className="landing-area-in" />
                  <path
                    d={path.line}
                    fill="none"
                    stroke="rgb(45,212,191)"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                    pathLength={1}
                    className="landing-draw"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle cx={path.last[0]} cy={path.last[1]} r="4" fill="rgb(45,212,191)" className="landing-dot-in" />
                  <circle cx={path.last[0]} cy={path.last[1]} r="10" fill="rgb(45,212,191)" opacity="0.25" className="landing-dot-pulse" />
                </g>
              ) : (
                <rect x="0" y={H * 0.3} width={W} height={H * 0.5} rx="8" fill="rgba(148,163,184,0.06)" className="animate-pulse" />
              )}
            </svg>

            {/* alert toast */}
            <div
              key={`toast-${k}`}
              className="landing-toast pointer-events-none absolute bottom-4 left-4 right-4 flex items-center gap-2.5 rounded-xl border border-[var(--accent)]/40 bg-[var(--background)]/95 px-3 py-2 shadow-lg sm:right-auto"
              style={{ animationDuration: `${CYCLE_MS}ms` }}
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--accent)]/15">
                <BellRing className="size-4 text-[var(--accent)]" />
              </span>
              <span className="text-[11px] leading-tight">
                <span className="font-semibold">Örnek alarm · {card?.displaySymbol}</span>
                <span className="block text-[var(--muted)]">Belirlediğin seviye geçildi, e-postana gönderildi</span>
              </span>
            </div>
          </div>

          {/* score + ai */}
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-4">
              {card ? <ScoreRing score={card.score} k={k} /> : <div className="size-[104px] animate-pulse rounded-full bg-[var(--border)]" />}
              <div className="min-w-0 flex-1 space-y-2.5">
                {card
                  ? factorsFor(card).map((f, i) => (
                      <FactorBar key={f.label} label={f.label} value={f.value} k={k} delay={250 + i * 180} />
                    ))
                  : null}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/60 p-3">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">
                <Sparkles className="size-3" /> AI özet
              </p>
              <p className="mt-1.5 min-h-[3.2em] text-xs leading-relaxed">
                {typed}
                <span className="landing-caret ml-0.5 inline-block h-3 w-[2px] translate-y-0.5 bg-[var(--accent)]" />
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-3 py-2 text-[11px] text-[var(--muted)]">
              <Mail className="size-3.5 shrink-0 text-[var(--accent)]" />
              <span>Her sabah 08:30&apos;da en güçlü 5 skor e-postanda.</span>
            </div>
            {card?.href ? (
              <Link href={card.href} className="block text-right text-xs font-medium text-[var(--accent)] hover:underline">
                {card.displaySymbol} analizini aç →
              </Link>
            ) : null}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-[var(--muted)]">
        Gerçek veri: skor ve 1 aylık grafik şu anki piyasadan. Yatırım tavsiyesi değildir.
      </p>
    </div>
  );
}
