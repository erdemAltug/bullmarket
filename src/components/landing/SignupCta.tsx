'use client';

import { ArrowRight } from 'lucide-react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { trackEvent } from '@/lib/analytics';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#042f2e] shadow-[0_0_28px_rgba(20,184,166,0.28)] transition hover:brightness-110';

/**
 * Landing sign-up button. Signed-in visitors go straight to the terminal,
 * so the CTA never asks someone to register twice.
 */
export function SignupCta({
  where,
  children = 'Ücretsiz hesap aç',
  className,
}: {
  /** Analytics label: hero, picks, benefits, final */
  where: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { openAuth } = useAuthGate();
  const { data: session } = authClient.useSession();

  if (session?.user) {
    return (
      <Link href="/terminal" className={cn(PRIMARY, className)}>
        Terminale git <ArrowRight className="size-4" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cn(PRIMARY, className)}
      onClick={() => {
        trackEvent('landing_signup_click', { where });
        openAuth({
          tab: 'register',
          feature: 'Ücretsiz hesap',
          headline: 'Ücretsiz Bullsye hesabı',
          subtitle: 'Sabah özeti, alarm e-postası ve her cihazda envanter.',
        });
      }}
    >
      {children} <ArrowRight className="size-4" />
    </button>
  );
}
