'use client';

import Link from 'next/link';
import { Bell, Briefcase, Landmark, Wallet } from 'lucide-react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { TerminalCtaButton } from '@/components/landing/TerminalCtaButton';

const POINTS = [
  { icon: Briefcase, title: 'Hisse', body: 'BİST, NASDAQ ve kripto lotları' },
  { icon: Landmark, title: 'Mevduat', body: 'Vade ve tutar, hisseyle aynı listede' },
  { icon: Wallet, title: 'Nakit', body: 'Kasadaki TRY ve döviz' },
  { icon: Bell, title: 'Alarm', body: 'Eşik yoksa asistan hatırlatır' },
] as const;

const SAMPLE = [
  { name: 'THYAO', meta: 'BİST lot', tag: 'Hisse' },
  { name: 'GARAN', meta: 'BİST lot', tag: 'Hisse' },
  { name: 'Mevduat', meta: 'TRY vade', tag: 'Nakit benzeri' },
  { name: 'Nakit', meta: 'Kasa', tag: 'TRY' },
  { name: 'Alarm', meta: 'THYAO fiyat eşiği', tag: 'Hatırlatma' },
] as const;

export function InventoryPitch() {
  const { openAuth } = useAuthGate();

  return (
    <section
      id="envanter"
      className="scroll-mt-20 border-b border-[var(--border)] py-16 sm:py-20"
    >
      <div className="mx-auto grid max-w-6xl items-stretch gap-6 px-4 sm:px-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Envanter
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Hisse, nakit, mevduat ve alarm tek hesapta. Asistan bu listeye göre
            cevap verir.
          </p>
          <ul className="mt-6 grid flex-1 gap-3 sm:grid-cols-2">
            {POINTS.map((point) => (
              <li
                key={point.title}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-3"
              >
                <point.icon className="size-4 text-[var(--accent)]" />
                <p className="mt-2 text-sm font-semibold">{point.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{point.body}</p>
              </li>
            ))}
          </ul>
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

        <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold">Örnek hesap</p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
              Canlı fiyat değil
            </p>
          </div>
          <ul className="mt-4 flex-1 divide-y divide-[var(--border)]">
            {SAMPLE.map((row) => (
              <li
                key={row.name}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{row.name}</p>
                  <p className="text-xs text-[var(--muted)]">{row.meta}</p>
                </div>
                <span className="rounded-md border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--muted)]">
                  {row.tag}
                </span>
              </li>
            ))}
          </ul>
          <TerminalCtaButton
            compact
            className="mt-2 inline-flex text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Terminalde aç
          </TerminalCtaButton>
        </div>
      </div>
    </section>
  );
}
