'use client';

import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { TerminalCtaButton } from '@/components/landing/TerminalCtaButton';

export function InventoryPitch() {
  const { openAuth } = useAuthGate();

  return (
    <section
      id="envanter"
      className="scroll-mt-20 border-b border-[var(--border)] py-16 sm:py-20"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Envanter
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Hisse · nakit · mevduat · alarm
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#042f2e] hover:brightness-110"
            >
              <Briefcase className="size-4" />
              Aç
            </Link>
            <button
              type="button"
              onClick={() =>
                openAuth({ tab: 'register', feature: 'Envanter' })
              }
              className="inline-flex items-center rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium hover:border-[var(--accent)]/40"
            >
              Hesap
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm">
          <p className="font-medium">Örnek</p>
          <p className="mt-2 text-[var(--muted)]">
            Mevduat + BİST lot · alarm yoksa hatırlatma
          </p>
          <TerminalCtaButton
            compact
            className="mt-4 inline-flex text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Terminal
          </TerminalCtaButton>
        </div>
      </div>
    </section>
  );
}
