'use client';

import { Lock } from 'lucide-react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

interface ProtectedFeatureProps {
  children: React.ReactNode;
  featureTitle?: string;
  className?: string;
  /** When true, always show gate (ignore session) — for nested demos */
  forceGate?: boolean;
}

export function ProtectedFeature({
  children,
  featureTitle = 'Bu Analizi Gör',
  className,
  forceGate = false,
}: ProtectedFeatureProps) {
  const { data: session, isPending } = authClient.useSession();
  const { openAuth } = useAuthGate();
  const unlocked = !forceGate && Boolean(session?.user);

  if (isPending) {
    return (
      <div
        className={cn(
          'h-32 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]',
          className
        )}
      />
    );
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]',
        className
      )}
    >
      <div className="pointer-events-none select-none opacity-40 blur-[6px] filter">
        {children}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-[var(--background)] via-[var(--background)]/85 to-transparent p-6 text-center">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <Lock className="size-4" />
        </div>
        <h3 className="mb-1 text-base font-bold text-[var(--foreground)]">
          {featureTitle} için Ücretsiz Hesap Oluşturun
        </h3>
        <p className="mb-4 max-w-xs text-xs text-[var(--muted)]">
          Nokta atışı AI sinyalleri, analist hedef fiyatları ve balina
          hareketlerini anında kilit açarak inceleyin.
        </p>
        <button
          type="button"
          onClick={() =>
            openAuth({
              tab: 'register',
              feature: featureTitle,
              headline: `Ücretsiz Kayıt Ol & ${featureTitle}`,
              subtitle:
                '1 tıkla Google ile devam et — sinyaller, hedefler ve balina takibi açılır.',
            })
          }
          className="rounded-lg bg-emerald-500 px-5 py-2 text-xs font-bold text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-400"
        >
          1 Tıkla Google ile Kayıt Ol
        </button>
      </div>
    </div>
  );
}

/** Inline blurred cell / row that opens auth on click */
export function LockedValue({
  feature,
  children,
  className,
}: {
  feature: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { data: session } = authClient.useSession();
  const { openAuth } = useAuthGate();

  if (session?.user) {
    return <span className={className}>{children}</span>;
  }

  return (
    <button
      type="button"
      onClick={() =>
        openAuth({
          tab: 'register',
          feature,
          headline: 'Ücretsiz Kayıt Ol & Kilidi Aç',
          subtitle: `${feature} bilgisini görmek için hesap oluşturun.`,
        })
      }
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-xs font-semibold text-emerald-300/90 hover:bg-emerald-500/15',
        className
      )}
    >
      <Lock className="size-3" />
      <span className="blur-[3px] select-none">{children ?? '••••'}</span>
      <span className="text-[10px] font-bold uppercase tracking-wide">
        Kilidi Aç
      </span>
    </button>
  );
}
