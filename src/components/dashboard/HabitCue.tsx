'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  Check,
  Flame,
} from 'lucide-react';
import { AssetDetailDrawer } from '@/components/dashboard/AssetDetailDrawer';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PotentialCard } from '@/lib/ai-opportunity';
import { cn } from '@/lib/utils';

const STREAK_KEY = 'bullsye:ritual-streak';
const DONE_KEY = 'bullsye:habit-cue-day';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

type StreakState = {
  count: number;
  lastCompleted: string | null;
};

function readStreak(): StreakState {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 0, lastCompleted: null };
    return JSON.parse(raw) as StreakState;
  } catch {
    return { count: 0, lastCompleted: null };
  }
}

function writeStreak(next: StreakState) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function money(n: number, currency: 'TRY' | 'USD') {
  const prefix = currency === 'USD' ? '$' : '₺';
  return `${prefix}${n.toLocaleString('tr-TR', {
    maximumFractionDigits: n >= 100 ? 2 : 4,
  })}`;
}

interface HabitCueProps {
  topCards: PotentialCard[];
}

/** Interactive 10-min daily ritual: 3-step review + streak. */
export function HabitCue({ topCards }: HabitCueProps) {
  const [mounted, setMounted] = useState(false);
  const [ritualOpen, setRitualOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [doneToday, setDoneToday] = useState(false);
  const [streak, setStreak] = useState<StreakState>({ count: 0, lastCompleted: null });
  const [drawerCard, setDrawerCard] = useState<PotentialCard | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cards = useMemo(() => topCards.slice(0, 3), [topCards]);

  useEffect(() => {
    setMounted(true);
    const today = todayKey();
    try {
      setDoneToday(localStorage.getItem(DONE_KEY) === today);
    } catch {
      setDoneToday(false);
    }
    setStreak(readStreak());
  }, []);

  if (!mounted) return null;

  function openRitual() {
    setStep(0);
    setRitualOpen(true);
  }

  function completeRitual() {
    const today = todayKey();
    const prev = readStreak();
    let count = 1;
    if (prev.lastCompleted) {
      const last = new Date(prev.lastCompleted + 'T12:00:00');
      const now = new Date(today + 'T12:00:00');
      const diffDays = Math.round(
        (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 0) count = prev.count;
      else if (diffDays === 1) count = prev.count + 1;
      else count = 1;
    }
    const next = { count, lastCompleted: today };
    writeStreak(next);
    try {
      localStorage.setItem(DONE_KEY, today);
    } catch {
      /* ignore */
    }
    setStreak(next);
    setDoneToday(true);
    setRitualOpen(false);
  }

  const current = cards[step];
  const totalSteps = Math.max(cards.length, 1);

  return (
    <>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex shrink-0 items-center gap-2">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Kısa tur
            </p>
            {streak.count > 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-orange-300">
                <Flame className="size-3" />
                {streak.count}g
              </span>
            ) : null}
            {doneToday ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-[var(--accent)]">
                <Check className="size-3" />
                Tamam
              </span>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {cards.length ? (
              cards.map((c) => (
                <button
                  key={c.symbol}
                  type="button"
                  onClick={() => {
                    setDrawerCard(c);
                    setDrawerOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs hover:border-[var(--accent)]/40"
                >
                  <span className="font-medium tabular-nums">
                    {c.displaySymbol}
                  </span>
                  <span className="font-mono text-[var(--accent)]">
                    {c.score}
                  </span>
                </button>
              ))
            ) : (
              <span className="text-xs text-[var(--muted)]">Veri bekleniyor</span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={openRitual}
              disabled={!cards.length}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[#042f2e] hover:brightness-110 disabled:opacity-50"
            >
              {doneToday ? 'Yeniden' : 'Başlat'}
              <ArrowRight className="size-3.5" />
            </button>
            <Link
              href="/firsatlar"
              className="px-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Liste
            </Link>
          </div>
        </div>
      </div>

      <Dialog open={ritualOpen} onOpenChange={setRitualOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="border-b border-[var(--border)] px-5 py-4 pr-12">
            <DialogTitle className="text-base font-semibold">
              Tur · {Math.min(step + 1, totalSteps)}/{totalSteps}
            </DialogTitle>
            <div className="mt-3 flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 flex-1 rounded-full',
                    i <= step ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                  )}
                />
              ))}
            </div>
          </div>

          {current ? (
            <div className="space-y-4 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-[var(--foreground)]">
                    {current.displaySymbol}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{current.name}</p>
                  <p className="mt-1 font-mono text-sm tabular-nums text-[var(--foreground)]/80">
                    {money(current.price, current.currency)}{' '}
                    <span
                      className={
                        current.changePercent >= 0
                          ? 'text-[var(--up)]'
                          : 'text-[var(--down)]'
                      }
                    >
                      {current.changePercent >= 0 ? '+' : ''}
                      {current.changePercent.toFixed(2)}%
                    </span>
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--glow-up)] px-2.5 py-1.5 text-center">
                  <p className="text-[9px] uppercase text-[var(--accent)]/80">Skor</p>
                  <p className="font-mono text-lg font-black text-[var(--up)]">
                    {current.score}
                    <span className="text-xs">/100</span>
                  </p>
                </div>
              </div>

              <ul className="space-y-1.5 text-xs text-[var(--muted)]">
                {current.catalysts.slice(0, 2).map((c) => (
                  <li key={c} className="flex gap-1.5">
                    <span className="text-[var(--accent)]">+</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDrawerCard(current);
                    setDrawerOpen(true);
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--accent)]/40"
                >
                  <Bell className="size-3.5" />
                  Detay
                </button>
                {step < totalSteps - 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[#042f2e] hover:brightness-110"
                  >
                    Sonraki
                    <ArrowRight className="size-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={completeRitual}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[#042f2e] hover:brightness-110"
                  >
                    <Check className="size-3.5" />
                    Bitir
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-[var(--muted)]">
              Veri bekleniyor
            </p>
          )}
        </DialogContent>
      </Dialog>

      <AssetDetailDrawer
        card={drawerCard}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
