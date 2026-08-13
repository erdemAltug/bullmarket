'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

const LS_KEY = 'bullsye_auth_toast_dismissed';
const TTL_MS = 24 * 60 * 60 * 1000;
const DELAY_MS = 8_000;
const SCROLL_RATIO = 0.35;

function dismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return true;
    return Date.now() - at < TTL_MS;
  } catch {
    return false;
  }
}

function scrollProgress(): number {
  const main = document.querySelector('main');
  const candidates = [
    main,
    document.scrollingElement,
    document.documentElement,
  ].filter((el): el is Element => Boolean(el));

  let best = 0;
  for (const el of candidates) {
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) continue;
    best = Math.max(best, el.scrollTop / max);
  }
  const docMax =
    document.documentElement.scrollHeight - window.innerHeight;
  if (docMax > 0) best = Math.max(best, window.scrollY / docMax);
  return best;
}

export function AuthToast() {
  const pathname = usePathname();
  const { openAuth } = useAuthGate();
  const { data: session, isPending } = authClient.useSession();
  const [visible, setVisible] = useState(false);
  const [blocked, setBlocked] = useState(true);

  const guest = !isPending && !session?.user;
  const marketing =
    pathname === '/' || pathname === '/tr' || pathname === '/en';

  useEffect(() => {
    setBlocked(dismissedRecently());
    setVisible(false);
  }, [pathname]);

  useEffect(() => {
    if (!guest || blocked) return;

    const reveal = () => setVisible(true);
    const timer = window.setTimeout(reveal, DELAY_MS);

    function onScroll() {
      if (scrollProgress() >= SCROLL_RATIO) reveal();
    }

    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document
      .querySelector('main')
      ?.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll, true);
      document
        .querySelector('main')
        ?.removeEventListener('scroll', onScroll);
    };
  }, [guest, blocked]);

  function dismiss() {
    try {
      localStorage.setItem(LS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
    setBlocked(true);
  }

  if (!guest || blocked || !visible) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className={cn(
        'fixed z-[55] max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-md',
        'left-4 right-4',
        marketing
          ? 'bottom-4'
          : 'bottom-[calc(4.75rem+env(safe-area-inset-bottom))]',
        'md:bottom-6 md:left-auto md:right-6 md:w-[22rem]',
        'animate-[auth-toast-in_0.45s_ease-out]'
      )}
    >
      <style>{`
        @keyframes auth-toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Kapat"
        className="absolute right-3 top-3 rounded p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
      >
        <X className="size-3.5" />
      </button>

      <div className="flex items-center gap-2">
        <span className="relative inline-flex size-2 shrink-0">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/70" />
          <span className="relative size-2 animate-pulse rounded-full bg-emerald-500" />
        </span>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-400">
          ⚡ AÇIK BETA
        </span>
      </div>

      <h2 className="mt-3 pr-6 text-sm font-semibold text-white">
        Bullsye Terminal&apos;e Hoş Geldiniz
      </h2>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
        Tüm AI Fırsat Skorları, Canlı Sinyaller ve Portföy Analizi lansmana özel
        tamamen ücretsizdir.
      </p>

      <button
        type="button"
        onClick={() =>
          openAuth({
            tab: 'register',
            feature: 'Auth Toast',
          })
        }
        className="mt-3 w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-black transition hover:bg-emerald-400"
      >
        [ 2 Saniyede Katıl → ]
      </button>
    </aside>
  );
}
