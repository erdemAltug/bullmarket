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
      className="scroll-mt-20 border-b border-[var(--border)] py-20 sm:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            Kişisel asistan
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Grafik her yerde. Senin envanterin burada.
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--muted)]">
            Hisse lotu, nakit, mevduat faizi ve fiyat alarmı tek sayfada.
            Özet senin sayılarından üretilir — herkese aynı terminal değil.
            Tarayıcıda dene; kayıt, başka cihazda da aynı envanter için.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-[var(--foreground)]">
            <li>Mevduat: tutar, yıllık %, vade</li>
            <li>Taşıdığın hisse ile alarmın eşleşir mi</li>
            <li>İzleme listesinde olup envanterde olmayanlar</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#042f2e] hover:brightness-110"
            >
              <Briefcase className="size-4" />
              Envanteri aç
            </Link>
            <button
              type="button"
              onClick={() =>
                openAuth({
                  tab: 'register',
                  feature: 'Envanter senkron',
                })
              }
              className="inline-flex items-center rounded-lg border border-[var(--border)] px-5 py-3 text-sm font-semibold hover:border-[var(--accent)]/40"
            >
              Kaydı aç — senkron
            </button>
          </div>
          <p className="mt-3 text-[11px] text-[var(--muted)]">
            Kayıt zorunlu değil. Zorunlu olan: yarın da aynı rakamları görmek.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Örnek özet
          </p>
          <p className="mt-3 text-sm font-semibold">Nakit yastık</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Mevduat satırın ve BİST lotun aynı ekranda. Faiz senin girdiğin oran;
            piyasa tahmini değil.
          </p>
          <p className="mt-4 text-sm font-semibold">Taşıyorsun, hedef yok</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Hisse envanterde, fiyat alarmı yoksa hatırlatırız. Karar sende.
          </p>
          <TerminalCtaButton
            compact
            className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Önce terminale bak
          </TerminalCtaButton>
        </div>
      </div>
    </section>
  );
}
