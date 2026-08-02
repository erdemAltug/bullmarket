'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const KEY = 'bullsye:habit-cue-day';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Soft daily return cue — dismissible, once per day. */
export function HabitCue() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === todayKey()) return;
      setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, todayKey());
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-zinc-950/80 px-4 py-3 sm:px-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-emerald-500/10 blur-2xl"
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
            <Sparkles className="size-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">
              Bugünün 10 dakikalık ritüeli
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
              Genişlik → Fırsat Masası → 3 kart → alarm. Yarın aynı alışkanlık
              seni geri getirir.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
          <Link
            href="/firsatlar"
            onClick={dismiss}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-black hover:bg-emerald-400"
          >
            Fırsatları aç
            <ArrowRight className="size-3.5" />
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg px-2 py-2 text-xs text-zinc-500 hover:text-zinc-300"
          >
            Gizle
          </button>
        </div>
      </div>
    </div>
  );
}
