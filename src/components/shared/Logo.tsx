'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showBadge?: boolean;
}

export function Logo({ className = '', showBadge = true }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'group flex select-none items-center gap-3 py-1 transition-all duration-300',
        className
      )}
    >
      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-gradient-to-tr from-emerald-600 via-zinc-900 to-zinc-950 p-[1px] shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-300 group-hover:border-emerald-400/60 group-hover:shadow-[0_0_22px_rgba(16,185,129,0.35)]">
        <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-black">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            className="h-7 w-7 text-emerald-400 transition-transform duration-300 group-hover:scale-105"
          >
            <path
              d="M6 8L11 15L16 12L21 15L26 8L20 20L16 26L12 20L6 8Z"
              fill="currentColor"
              fillOpacity="0.15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M11 15L16 5L21 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="18" r="1.5" fill="#10B981" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col leading-none">
        <span className="text-xl font-black tracking-tighter text-zinc-100">
          BULL
          <span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            .
          </span>
          MARKET
          {showBadge ? (
            <span className="relative ml-2 inline-flex h-2 w-2 align-middle">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          ) : null}
        </span>
        <span className="mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.3em] text-emerald-500/80">
          FINANCIAL TERMINAL
        </span>
      </div>
    </Link>
  );
}
