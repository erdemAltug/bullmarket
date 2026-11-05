'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, Flame, Radio, Search, X, Zap } from 'lucide-react';
import type { PotentialCard } from '@/lib/ai-opportunity';
import { AIDailyVisionPanel } from '@/components/dashboard/AIDailyVisionPanel';
import { AIPotentialRadar } from '@/components/dashboard/AIPotentialRadar';
import { AISignalRadar } from '@/components/dashboard/AISignalRadar';
import { MarketSentimentMeter } from '@/components/dashboard/MarketSentimentMeter';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import {
  buildDailyVision,
  buildPotentialCards,
  computeMarketSentiment,
} from '@/lib/ai-opportunity';
import { cn } from '@/lib/utils';

const LS_SEEN = 'bullsye:firsat:seen';
const LS_STREAK = 'bullsye:firsat:streak';
const LS_LAST_DAY = 'bullsye:firsat:lastDay';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readStreak(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const last = localStorage.getItem(LS_LAST_DAY);
    const raw = Number(localStorage.getItem(LS_STREAK) || '0');
    const today = todayKey();
    if (last === today) return Number.isFinite(raw) ? raw : 0;
    if (!last) {
      localStorage.setItem(LS_LAST_DAY, today);
      localStorage.setItem(LS_STREAK, '1');
      return 1;
    }
    const prev = new Date(last);
    const cur = new Date(today);
    const diffDays = Math.round(
      (cur.getTime() - prev.getTime()) / 86_400_000
    );
    const next = diffDays === 1 ? Math.max(1, raw) + 1 : 1;
    localStorage.setItem(LS_LAST_DAY, today);
    localStorage.setItem(LS_STREAK, String(next));
    return next;
  } catch {
    return 0;
  }
}

type CardMarket = 'ALL' | 'BIST' | 'US' | 'CRYPTO' | 'FUND';
type CardSort = 'score' | 'up' | 'down' | 'pe';

const CARD_MARKETS: [CardMarket, string][] = [
  ['ALL', 'Tümü'],
  ['BIST', 'BİST'],
  ['US', 'ABD'],
  ['CRYPTO', 'Kripto'],
  ['FUND', 'Fon & ETF'],
];

function fold(v: string) {
  return v
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

function filterCards(cards: PotentialCard[], market: CardMarket, query: string, sort: CardSort, min: number) {
  const q = fold(query.trim());
  const list = cards.filter((c) => {
    if (market === 'FUND') {
      if (c.category !== 'FON' && c.category !== 'ETF') return false;
    } else if (market !== 'ALL' && c.category !== market) return false;
    if (c.score < min) return false;
    if (q && !fold(c.displaySymbol).includes(q) && !fold(c.name).includes(q)) return false;
    return true;
  });
  const pe = (c: PotentialCard) => (c.trailingPE && c.trailingPE > 0 ? c.trailingPE : Infinity);
  const by: Record<CardSort, (a: PotentialCard, b: PotentialCard) => number> = {
    score: (a, b) => b.score - a.score,
    up: (a, b) => b.changePercent - a.changePercent,
    down: (a, b) => a.changePercent - b.changePercent,
    pe: (a, b) => pe(a) - pe(b),
  };
  return [...list].sort(by[sort]);
}

export function OpportunityHunt() {
  const scanner = useMarketScanner();

  const [streak, setStreak] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [countdown, setCountdown] = useState(10);

  const marketItems = scanner.data ?? [];

  const dailyVision = useMemo(
    () => (marketItems.length ? buildDailyVision(marketItems) : null),
    [marketItems]
  );
  const allCards = useMemo(
    () => buildPotentialCards(marketItems, 400),
    [marketItems]
  );
  const [cMarket, setCMarket] = useState<CardMarket>('ALL');
  const [cQuery, setCQuery] = useState('');
  const [cSort, setCSort] = useState<CardSort>('score');
  const [cMin, setCMin] = useState(0);
  const [cLimit, setCLimit] = useState(12);
  const filteredCards = useMemo(
    () => filterCards(allCards, cMarket, cQuery, cSort, cMin),
    [allCards, cMarket, cQuery, cSort, cMin]
  );
  const potentialCards = useMemo(() => filteredCards.slice(0, cLimit), [filteredCards, cLimit]);
  const cFiltersOn = cMarket !== 'ALL' || cQuery !== '' || cSort !== 'score' || cMin > 0;
  const sentiment = useMemo(
    () => (marketItems.length ? computeMarketSentiment(marketItems) : null),
    [marketItems]
  );

  const hotCount = allCards.filter((c) => c.score >= 75).length;

  useEffect(() => {
    setStreak(readStreak());
  }, []);

  useEffect(() => {
    if (!potentialCards.length) return;
    try {
      const prev = JSON.parse(
        localStorage.getItem(LS_SEEN) || '[]'
      ) as string[];
      const prevSet = new Set(prev);
      const ids = potentialCards.map((c) => c.symbol);
      const fresh = ids.filter((id) => !prevSet.has(id)).length;
      setNewCount(fresh);
      localStorage.setItem(LS_SEEN, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [potentialCards]);

  useEffect(() => {
    if (!scanner.updatedAt) return;
    setCountdown(10);
    const id = window.setInterval(() => {
      setCountdown((c) => (c <= 1 ? 10 : c - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [scanner.updatedAt]);

  return (
    <div className="relative space-y-6 pb-32 md:pb-24">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/35 bg-[var(--glow-up)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--accent)]">
            <Radio className="size-3.5 animate-pulse" />
            Canlı
          </span>
          {streak > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
              <Flame className="size-3.5" />
              {streak}g
            </span>
          ) : null}
          {newCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium text-sky-300">
              <Zap className="size-3.5" />
              +{newCount}
            </span>
          ) : null}
        </div>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Skor taraması
        </h2>
        <p className="text-xs text-[var(--muted)]">
          Yenileme {countdown}s
        </p>
      </header>

      <AIDailyVisionPanel
        report={dailyVision}
        loading={scanner.isLoading}
      />

      {sentiment ? (
        <MarketSentimentMeter
          reading={sentiment}
          loading={scanner.isLoading}
        />
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {CARD_MARKETS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setCMarket(id);
                  setCLimit(12);
                }}
                className={cn(
                  'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                  cMarket === id
                    ? 'bg-emerald-500 text-black'
                    : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative lg:ml-auto lg:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="search"
              value={cQuery}
              onChange={(e) => {
                setCQuery(e.target.value);
                setCLimit(12);
              }}
              placeholder="Sembol veya şirket ara…"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-xs outline-none placeholder:text-[var(--muted)] focus:border-emerald-500/50"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={cMin}
                onChange={(e) => {
                  setCMin(Number(e.target.value));
                  setCLimit(12);
                }}
                aria-label="En düşük skor"
                className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-2.5 pr-7 text-xs outline-none"
              >
                <option value={0}>Tüm skorlar</option>
                <option value={60}>Skor 60+</option>
                <option value={70}>Skor 70+</option>
                <option value={80}>Skor 80+</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted)]" />
            </div>
            <div className="relative flex-1">
              <select
                value={cSort}
                onChange={(e) => setCSort(e.target.value as CardSort)}
                aria-label="Sıralama"
                className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-2.5 pr-7 text-xs outline-none"
              >
                <option value="score">En yüksek skor</option>
                <option value="up">En çok yükselen</option>
                <option value="down">En çok düşen</option>
                <option value="pe">En düşük F/K</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted)]" />
            </div>
          </div>
        </div>
        <p className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
          {filteredCards.length} sembol
          {cFiltersOn ? (
            <button
              type="button"
              onClick={() => {
                setCMarket('ALL');
                setCQuery('');
                setCSort('score');
                setCMin(0);
                setCLimit(12);
              }}
              className="inline-flex items-center gap-1 hover:text-[var(--foreground)]"
            >
              <X className="size-3" /> Temizle
            </button>
          ) : null}
        </p>
        <AIPotentialRadar
          cards={potentialCards}
          loading={scanner.isLoading}
        />
        {filteredCards.length > potentialCards.length ? (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setCLimit((n) => n + 24)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-xs font-bold text-[var(--muted)] transition-all hover:border-emerald-500/40 hover:text-[var(--foreground)]"
            >
              Daha fazla göster · {filteredCards.length - potentialCards.length} sembol kaldı
            </button>
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-base font-semibold tracking-tight">Sinyaller</h2>
          <Link
            href="/signals"
            className="text-xs font-medium text-[var(--accent)] hover:underline"
          >
            Tümü →
          </Link>
        </div>
        <AISignalRadar
          marketItems={marketItems}
          isLoading={scanner.isLoading}
        />
      </section>

      <div
        className={cn(
          'fixed inset-x-0 z-30 border-t border-[var(--accent)]/20',
          'bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-0',
          'bg-[var(--surface)]/95 px-3 py-2.5 backdrop-blur-xl sm:px-4 sm:py-3',
          'md:pb-[max(0.75rem,env(safe-area-inset-bottom))]'
        )}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 text-sm">
            <p className="font-medium text-[var(--foreground)]">
              {hotCount > 0
                ? `${hotCount} yüksek skor`
                : `${potentialCards.length} sembol`}
              {newCount > 0 ? (
                <span className="ml-2 text-sky-300">· +{newCount}</span>
              ) : null}
            </p>
            <p className="text-[11px] text-[var(--muted)]">{countdown}s</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">
            <Link
              href="/alerts"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:border-[var(--accent)]/40 sm:flex-none"
            >
              <Bell className="size-3.5" />
              Alarm
            </Link>
            <Link
              href="/signals"
              className="flex-1 rounded-lg bg-[var(--accent)] px-4 py-2 text-center text-xs font-semibold text-[#042f2e] hover:brightness-110 sm:flex-none"
            >
              Sinyaller
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
