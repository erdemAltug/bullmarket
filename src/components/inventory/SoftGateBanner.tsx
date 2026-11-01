'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const DISMISS_KEY = 'bullsye_softgate_dismiss';
const VARIANT_KEY = 'bullsye_softgate_variant';
const DAY = 86_400_000;

/** A = original sync copy (control), B = loss-aversion + digest benefit. */
const COPY = {
  a: {
    text: 'Rakamlarını cihazlar arasında kaybetmemek için Google ile tek tıkla kaydet.',
    cta: 'Hesabı bağla',
  },
  b: {
    text: 'Envanterin şu an sadece bu tarayıcıda. Ücretsiz hesapla her cihazda aç, sabah özetini e-postayla al.',
    cta: 'Ücretsiz kaydet',
  },
} as const;
type Variant = keyof typeof COPY;

const noopSubscribe = () => () => {};

/** Sticky 50/50 assignment per browser; SSR renders nothing anyway. */
function readVariant(): Variant {
  try {
    const v = localStorage.getItem(VARIANT_KEY);
    if (v === 'a' || v === 'b') return v;
    const next: Variant = Math.random() < 0.5 ? 'a' : 'b';
    localStorage.setItem(VARIANT_KEY, next);
    return next;
  } catch {
    return 'a';
  }
}

function readDismissed(): boolean {
  try {
    const until = Number(localStorage.getItem(DISMISS_KEY));
    return Number.isFinite(until) && Date.now() < until;
  } catch {
    return false;
  }
}

type SoftGateBannerProps = {
  /** Guest ve en az 1 pozisyon */
  visible: boolean;
  /** 2. varlık eklendiğinde true zorla */
  force?: boolean;
  className?: string;
};

/**
 * Soft gate — envanter kartının üstünde doğal banner.
 * Agresif popup yok. Dismiss 24s. Kopya A/B (PRD P2).
 */
export function SoftGateBanner({
  visible,
  force = false,
  className,
}: SoftGateBannerProps) {
  const { openAuth } = useAuthGate();
  const [dismissedNow, setDismissedNow] = useState(false);
  const variant = useSyncExternalStore(noopSubscribe, readVariant, () => null);
  const storedDismiss = useSyncExternalStore(
    noopSubscribe,
    readDismissed,
    () => true
  );
  const shown =
    visible && variant !== null && !dismissedNow && (force || !storedDismiss);

  const viewTracked = useRef(false);
  useEffect(() => {
    if (shown && variant && !viewTracked.current) {
      viewTracked.current = true;
      trackEvent('softgate_view', { variant, forced: force });
    }
  }, [shown, variant, force]);

  if (!shown || !variant) return null;
  const copy = COPY[variant];

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DAY));
    } catch {
      /* ignore */
    }
    setDismissedNow(true);
    trackEvent('softgate_dismiss', { variant: variant ?? 'a' });
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-teal-500/25 bg-teal-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
      role="status"
      data-variant={variant}
    >
      <p className="text-sm leading-relaxed text-[var(--foreground)]">
        {copy.text}
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          onClick={() => {
            trackEvent('softgate_click', { variant });
            openAuth({ tab: 'register', feature: 'Envanter senkron' });
          }}
        >
          {copy.cta}
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
