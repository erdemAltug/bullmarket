'use client';

import { useEffect, useState } from 'react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DISMISS_KEY = 'bullsye_softgate_dismiss';
const DAY = 86_400_000;

type SoftGateBannerProps = {
  /** Guest ve en az 1 pozisyon */
  visible: boolean;
  /** 2. varlık eklendiğinde true zorla */
  force?: boolean;
  className?: string;
};

/**
 * Soft gate — envanter kartının üstünde doğal banner.
 * Agresif popup yok. Dismiss 24s.
 */
export function SoftGateBanner({
  visible,
  force = false,
  className,
}: SoftGateBannerProps) {
  const { openAuth } = useAuthGate();
  const [blocked, setBlocked] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (!raw) {
        setBlocked(false);
        return;
      }
      const until = Number(raw);
      setBlocked(Number.isFinite(until) && Date.now() < until);
    } catch {
      setBlocked(false);
    }
  }, [visible, force]);

  if (!visible || (blocked && !force)) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DAY));
    } catch {
      /* ignore */
    }
    setBlocked(true);
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-teal-500/25 bg-teal-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
      role="status"
    >
      <p className="text-sm leading-relaxed text-[var(--foreground)]">
        Rakamlarını cihazlar arasında kaybetmemek için Google ile tek tıkla
        kaydet.
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          onClick={() =>
            openAuth({ tab: 'register', feature: 'Envanter senkron' })
          }
        >
          Hesabı bağla
        </Button>
        <button
          type="button"
          onClick={dismiss}
          className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Sonra
        </button>
      </div>
    </div>
  );
}
