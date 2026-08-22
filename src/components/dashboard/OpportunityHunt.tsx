'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, Flame, Radio, Zap } from 'lucide-react';
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
  const potentialCards = useMemo(
    () => buildPotentialCards(marketItems, 12),
    [marketItems]
  );
  const sentiment = useMemo(
    () => (marketItems.length ? computeMarketSentiment(marketItems) : null),
    [marketItems]
  );

  const hotCount = potentialCards.filter((c) => c.score >= 75).length;

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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/35 bg-[var(--glow-up)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--accent)]">
            <Radio className="size-3.5 animate-pulse" />
            ANLIK FIRSAT MASASI
          </span>
          {streak > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
              <Flame className="size-3.5" />
              {streak} gün seri
            </span>
          ) : null}
          {newCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
              <Zap className="size-3.5" />
              {newCount} yeni fırsat
            </span>
          ) : null}
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Canlı fırsat masası
        </h2>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Canlı skor, gün içi bant ve hacim ivmesi. Masa her{' '}
          <span className="font-mono text-[var(--accent)]">{countdown}s</span>{' '}
          yenilenir.
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

      <AIPotentialRadar
        cards={potentialCards}
        loading={scanner.isLoading}
      />

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Anlık AL sinyalleri
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Fırsat kartlarından sonra teknik momentum — tam liste açık beta
            </p>
          </div>
          <Link
            href="/signals"
            className="text-xs font-medium text-[var(--accent)] hover:underline"
          >
            Tam sinyal radarı →
          </Link>
        </div>
        <AISignalRadar
          marketItems={marketItems}
          isLoading={scanner.isLoading}
        />
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="mb-2 text-base font-semibold text-[var(--foreground)]">
          Metodoloji
        </h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Skor; canlı F/K, hacim ivmesi ve gün içi bant pozisyonundan
            üretilir.
          </li>
          <li>
            Her kartta mikro inceleme, izleme listesi ve fiyat alarmı bulunur.
          </li>
          <li>
            Açık Beta’da AI fırsat skorları ve canlı sinyaller ücretsizdir;
            özel alarmlar için 2 saniyede kayıt yeter.
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <Link href="/targets" className="text-[var(--accent)] hover:underline">
            Analist hedefleri
          </Link>
          <Link href="/compare" className="text-[var(--accent)] hover:underline">
            1v1 kıyasla
          </Link>
          <Link href="/alerts" className="text-[var(--accent)] hover:underline">
            Alarmlar
          </Link>
          <Link href="/egitim" className="text-[var(--accent)] hover:underline">
            Eğitim
          </Link>
        </div>
      </section>

      {/* Sticky FOMO bar — above bottom nav on mobile, no double safe-area */}
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
            <p className="font-semibold text-[var(--foreground)]">
              {hotCount > 0
                ? `${hotCount} yüksek skorlu fırsat açık`
                : `${potentialCards.length} canlı fırsat taranıyor`}
              {newCount > 0 ? (
                <span className="ml-2 text-sky-300">· {newCount} yeni</span>
              ) : null}
            </p>
            <p className="truncate text-[11px] text-[var(--muted)]">
              Sonraki tarama {countdown}s
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">
            <Link
              href="/alerts"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--foreground)] hover:border-[var(--accent)]/40 sm:flex-none"
            >
              <Bell className="size-3.5" />
              Alarmlar
            </Link>
            <Link
              href="/signals"
              className="flex-1 rounded-lg bg-[var(--accent)] px-4 py-2 text-center text-xs font-bold text-[#042f2e] hover:brightness-110 sm:flex-none"
            >
              Sinyal radarı
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
