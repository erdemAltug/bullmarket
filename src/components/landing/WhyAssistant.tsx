'use client';

import { Briefcase, LayoutDashboard, LineChart } from 'lucide-react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';

const POINTS = [
  {
    icon: LayoutDashboard,
    title: 'Terminal',
    body: 'Skor, sinyal, hedef — aynı ekran.',
  },
  {
    icon: Briefcase,
    title: 'Envanter',
    body: 'Lot, nakit, mevduat, alarm.',
  },
  {
    icon: LineChart,
    title: 'Detay',
    body: 'BİST · NASDAQ · kripto sayfaları.',
  },
] as const;

export function WhyAssistant() {
  const { openAuth } = useAuthGate();

  return (
    <section
      id="neden-asistan"
      className="scroll-mt-20 border-b border-[var(--border)] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Ne sunuyoruz
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {POINTS.map((p) => (
            <li key={p.title}>
              <p.icon className="size-5 text-[var(--accent)]" />
              <h3 className="mt-3 text-sm font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{p.body}</p>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => openAuth({ tab: 'register', feature: 'Landing' })}
          className="mt-8 text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Hesap oluştur
        </button>
      </div>
    </section>
  );
}
