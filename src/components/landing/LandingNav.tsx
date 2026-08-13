'use client';

import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { TerminalCtaButton } from '@/components/landing/TerminalCtaButton';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '#ozellikler', label: 'Özellikler' },
  { href: '#skor-kontrol', label: 'Skor dene' },
  { href: '/targets', label: 'Analist Hedefleri' },
  { href: '#sss', label: 'SSS' },
] as const;

export function LandingNav() {
  const { openAuth } = useAuthGate();
  const { data: session } = authClient.useSession();
  const signedIn = Boolean(session?.user);

  return (
    <header className="absolute inset-x-0 z-40" style={{ top: 'var(--launch-banner-h, 0px)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Logo showBadge={false} />
        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <Link
              href="/terminal"
              prefetch
              className={cn(
                'rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-bold text-[#042f2e]',
                'transition hover:brightness-110'
              )}
            >
              Canlı Terminale Geç
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuth({ tab: 'login' })}
                className="hidden rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)] sm:inline-flex"
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => openAuth({ tab: 'register' })}
                className="hidden rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)]/40 sm:inline-flex"
              >
                Kayıt Ol
              </button>
              <TerminalCtaButton
                compact
                className={cn(
                  'rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-bold text-[#042f2e]',
                  'transition hover:brightness-110'
                )}
              >
                Canlı Terminale Geç
              </TerminalCtaButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
