import { Bell, Briefcase, MessageSquare, Sunrise } from 'lucide-react';
import { SignupCta } from '@/components/landing/SignupCta';

const BENEFITS = [
  {
    icon: Sunrise,
    title: 'Sabah özeti',
    body: 'Hafta içi 08:30’da günün en yüksek 5 skoru ve gerekçesi. Tek e-posta, tek tıkla çık.',
  },
  {
    icon: Bell,
    title: 'Alarm e-postası',
    body: 'Fiyat, değişim veya RSI eşiğin aşılınca sekme kapalıyken de haberin olur.',
  },
  {
    icon: Briefcase,
    title: 'Her cihazda envanter',
    body: 'Lot, maliyet, nakit ve mevduat telefonda da bilgisayarda da aynı.',
  },
  {
    icon: MessageSquare,
    title: 'Seni tanıyan asistan',
    body: 'Yoğunlaşma, hedef fiyat ve alarm boşluklarını senin verinle özetler.',
  },
] as const;

const STEPS = [
  { n: '1', title: 'Hesap aç', body: 'Google ile tek tık veya e-posta. Kart istemez.' },
  { n: '2', title: 'İzlediklerini ekle', body: 'Hisse, kripto, nakit, mevduat — ya da sadece alarm.' },
  { n: '3', title: 'Sabah 10 dakika', body: 'Özet e-postanda, skor ve alarmlar terminalde.' },
] as const;

export function SignupBenefits() {
  return (
    <section
      id="neden-hesap"
      className="scroll-mt-20 border-b border-[var(--border)] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Ücretsiz hesap
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Terminal herkese açık. Hesap, piyasayı senin yerine izler.
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Kayıt olmadan tarama ve skorlar açık. Hesapla birlikte Bullsye seni
            her sabah ve eşik aşıldığında kendisi bulur.
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <li
              key={b.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <span className="inline-flex rounded-lg bg-[var(--accent)]/10 p-2 text-[var(--accent)]">
                <b.icon className="size-4" />
              </span>
              <h3 className="mt-4 text-sm font-semibold">{b.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                {b.body}
              </p>
            </li>
          ))}
        </ul>

        <ol className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/40 font-mono text-sm font-bold text-[var(--accent)]">
                {s.n}
              </span>
              <div>
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <SignupCta where="benefits" />
          <p className="text-xs text-[var(--muted)]">
            Açık beta · ücretsiz · istediğin an sil
          </p>
        </div>
      </div>
    </section>
  );
}
