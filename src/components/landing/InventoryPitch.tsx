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
            Hisse lotu, nakit, mevduat ve fiyat alarmı tek sayfada. Özet, genel
            piyasa skorundan değil — sizin girdiğiniz rakamlardan üretilir.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-[var(--foreground)]">
            <li>Mevduat: tutar, yıllık oran ve vade</li>
            <li>Taşıdığınız hisse ile alarm eşleşmesi</li>
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
                  feature: 'Envanter hesabı',
                })
              }
              className="inline-flex items-center rounded-lg border border-[var(--border)] px-5 py-3 text-sm font-semibold hover:border-[var(--accent)]/40"
            >
              Hesap oluştur
            </button>
          </div>
          <p className="mt-3 text-[11px] text-[var(--muted)]">
            Hesap zorunlu değildir. Aynı envanteri başka cihazda görmek için
            yeterlidir.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Örnek özet
          </p>
          <p className="mt-3 text-sm font-semibold">Nakit yastık</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Mevduat ve BİST lotları aynı ekranda. Faiz, sizin girdiğiniz oran;
            piyasa tahmini değildir.
          </p>
          <p className="mt-4 text-sm font-semibold">Pozisyon var, hedef yok</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Envanterdeki hisse için fiyat alarmı yoksa hatırlatırız. Karar size
            aittir.
          </p>
          <TerminalCtaButton
            compact
            className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Terminale göz at
          </TerminalCtaButton>
        </div>
      </div>
    </section>
  );
}
