'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Crown, Sparkles } from 'lucide-react';
import { usePlan } from '@/hooks/usePlan';
import { useProRequest } from '@/components/pro/ProRequest';
import {
  ELITE_FEATURES,
  ELITE_PRICE,
  FOUNDER_SEATS,
  PLAN_LABEL,
  FREE_FEATURES,
  PRO_FEATURES,
  PRO_PRICE,
  formatTl,
  type ProPlanChoice,
} from '@/lib/pro-plan';
import { cn } from '@/lib/utils';

const FAQ = [
  {
    q: 'Şimdi ödeme alınıyor mu?',
    a: 'Hayır. Pro davetle açılıyor; talep bırakanlara davet e-postası gelir. Ödeme ancak sen daveti kabul edip planı seçtiğinde başlar.',
  },
  {
    q: 'Kurucu üye fiyatı nedir?',
    a: `İlk ${FOUNDER_SEATS} kişi Pro'yu ${formatTl(PRO_PRICE.founderMonthly)}/ay ile kullanır ve abonelik sürdükçe bu fiyat korunur.`,
  },
  {
    q: 'Ücretsiz plan kalkacak mı?',
    a: 'Hayır. Tarama, skor, hedef fiyatlar, izleme listesi ve temel alarmlar ücretsiz kalır.',
  },
  {
    q: 'Pro yatırım tavsiyesi verir mi?',
    a: 'Hayır. Pro daha fazla alarm, veri ve rapor sunar; al/sat önerisi içermez. Kararlar sana aittir.',
  },
  {
    q: 'İptal edebilir miyim?',
    a: 'Evet, tek tıkla. Taahhüt yok.',
  },
] as const;

export function PricingView() {
  const { openPro } = useProRequest();
  const [plan, setPlan] = useState<ProPlanChoice>('yearly');
  const price = plan === 'yearly' ? PRO_PRICE.yearly : PRO_PRICE.monthly;
  const elitePrice = plan === 'yearly' ? ELITE_PRICE.yearly : ELITE_PRICE.monthly;
  const me = usePlan();

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-8">
      <header className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Bullsye Pro
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Piyasayı senin yerine daha yakından izler
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--muted)] sm:text-base">
          Ücretsiz plan her zaman açık. Pro; sınırsız ve daha hızlı alarm, skor
          geçmişi ve kişisel raporlar ekler.
        </p>

        <div
          role="tablist"
          className="mt-6 inline-flex rounded-lg border border-[var(--border)] p-0.5 text-sm"
        >
          {(
            [
              ['monthly', 'Aylık'],
              ['yearly', 'Yıllık · 2 ay hediye'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={plan === id}
              onClick={() => setPlan(id)}
              className={cn(
                'rounded-md px-4 py-1.5 font-medium',
                plan === id
                  ? 'bg-[var(--card)] text-[var(--foreground)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {me.isPaid ? (
        <p className="mx-auto w-fit rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-300">
          Aktif planın: {PLAN_LABEL[me.plan]} ✓
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <section className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold">Ücretsiz</h2>
          <p className="mt-2">
            <span className="text-3xl font-semibold">0 TL</span>
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">Kayıt olmadan da kullanılır</p>
          <ul className="mt-6 flex-1 space-y-2.5 text-sm">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--muted)]" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/terminal"
            className="mt-6 inline-flex justify-center rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface)]"
          >
            Ücretsiz kullan
          </Link>
        </section>

        <section className="relative flex flex-col rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/[0.08] to-[var(--card)] p-6 shadow-[0_0_40px_rgba(20,184,166,0.10)]">
          <span className="absolute -top-3 left-6 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[11px] font-bold text-[#042f2e]">
            İlk {FOUNDER_SEATS} kişiye kurucu fiyatı
          </span>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="size-4 text-emerald-400" /> Pro
          </h2>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{formatTl(price)}</span>
            <span className="text-sm text-[var(--muted)]">
              /{plan === 'yearly' ? 'yıl' : 'ay'}
            </span>
          </p>
          <p className="mt-1 text-xs text-emerald-300">
            Kurucu üye: {formatTl(PRO_PRICE.founderMonthly)}/ay, abonelik sürdükçe
          </p>
          <ul className="mt-6 flex-1 space-y-2.5 text-sm">
            <li className="flex items-start gap-2 text-[var(--muted)]">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
              Ücretsiz plandaki her şey
            </li>
            {PRO_FEATURES.map((f) => (
              <li key={f.id} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                <span>
                  <span className="font-medium">{f.label}</span>
                  <span className="block text-xs text-[var(--muted)]">{f.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => openPro('pricing_page', plan)}
            className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[#042f2e] shadow-[0_0_28px_rgba(20,184,166,0.28)] hover:brightness-110"
          >
            <Sparkles className="size-4" /> Pro’ya erken erişim al
          </button>
          <p className="mt-2 text-center text-[11px] text-[var(--muted)]">
            Şimdi ödeme alınmaz · davet e-postayla gelir
          </p>
        </section>

        <section className="flex flex-col rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-500/[0.07] to-[var(--card)] p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Crown className="size-4 text-amber-400" /> Elite
          </h2>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{formatTl(elitePrice)}</span>
            <span className="text-sm text-[var(--muted)]">/{plan === 'yearly' ? 'yıl' : 'ay'}</span>
          </p>
          <p className="mt-1 text-xs text-amber-300">Aktif yatırımcı ve profesyoneller için</p>
          <ul className="mt-6 flex-1 space-y-2.5 text-sm">
            {ELITE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-amber-400" />
                {f}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => openPro('pricing_elite', plan)}
            className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/50 px-4 py-2.5 text-sm font-bold text-amber-300 hover:bg-amber-500/10"
          >
            <Crown className="size-4" /> Elite’e erken erişim al
          </button>
        </section>
      </div>

      <section className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-center text-lg font-semibold">Sık sorulanlar</h2>
        <dl className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          {FAQ.map((f) => (
            <div key={f.q} className="p-4">
              <dt className="text-sm font-medium">{f.q}</dt>
              <dd className="mt-1 text-sm text-[var(--muted)]">{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-center text-[11px] text-[var(--muted)]">
          Bullsye bilgilendirme amaçlıdır; yatırım tavsiyesi değildir.
        </p>
      </section>
    </div>
  );
}
