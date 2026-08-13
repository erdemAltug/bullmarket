'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { authClient } from '@/lib/auth/client';
import { BETA_AUTH_HEADLINE, BETA_AUTH_SUBTITLE } from '@/lib/beta';
import { cn } from '@/lib/utils';

const LS_KEY = 'bullsye:launch-banner-dismissed';
const BANNER_H = '2.5rem';

export function LaunchBanner() {
  const [visible, setVisible] = useState(false);
  const { openAuth } = useAuthGate();
  const { data: session } = authClient.useSession();
  const signedIn = Boolean(session?.user);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(LS_KEY) !== '1');
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--launch-banner-h',
      visible ? BANNER_H : '0px'
    );
    return () => {
      document.documentElement.style.setProperty('--launch-banner-h', '0px');
    };
  }, [visible]);

  function dismiss() {
    try {
      localStorage.setItem(LS_KEY, '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  function join() {
    if (signedIn) return;
    openAuth({
      tab: 'register',
      feature: 'Açık Beta',
      headline: BETA_AUTH_HEADLINE,
      subtitle: BETA_AUTH_SUBTITLE,
    });
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Açık Beta duyurusu"
      className={cn(
        'sticky top-0 z-[60] flex h-10 items-center border-b border-emerald-500/20',
        'bg-slate-900 text-[11px] text-slate-200 sm:text-xs'
      )}
    >
      <div className="mx-auto flex w-full max-w-[1600px] items-center gap-2 px-3 sm:px-4">
        <span
          aria-hidden
          className="relative inline-flex size-2 shrink-0"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
          <span className="relative size-2 rounded-full bg-emerald-400" />
        </span>

        <p className="min-w-0 flex-1 truncate sm:hidden">
          ⚡ Açık Beta: Tüm AI Özellikleri Lansmana Özel Ücretsiz{' '}
          {signedIn ? (
            <Link
              href="/terminal"
              className="font-bold text-emerald-300 underline-offset-2 hover:underline"
            >
              [Terminale Katıl →]
            </Link>
          ) : (
            <button
              type="button"
              onClick={join}
              className="font-bold text-emerald-300 underline-offset-2 hover:underline"
            >
              [Giriş Yap →]
            </button>
          )}
        </p>

        <p className="hidden min-w-0 flex-1 truncate sm:block">
          ⚡ <strong className="font-semibold text-white">Bullsye Terminal Açık Beta&apos;da:</strong>{' '}
          Lansmana özel tüm AI Fırsat Skorları, Canlı Sinyaller ve Portföy
          Taraması tamamen ücretsiz.{' '}
          {signedIn ? (
            <Link
              href="/terminal"
              className="font-bold text-emerald-300 underline-offset-2 hover:underline"
            >
              [Terminale Katıl →]
            </Link>
          ) : (
            <button
              type="button"
              onClick={join}
              className="font-bold text-emerald-300 underline-offset-2 hover:underline"
            >
              [Terminale Katıl →]
            </button>
          )}
        </p>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Duyuruyu kapat"
          className="shrink-0 rounded p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
