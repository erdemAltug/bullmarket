import Link from 'next/link';
import {
  Activity,
  Crosshair,
  Newspaper,
  Waves,
  Zap,
} from 'lucide-react';
import { AssetChecker } from '@/components/landing/AssetChecker';
import { FaqAccordion } from '@/components/landing/FaqAccordion';
import { HeroDemo } from '@/components/landing/HeroDemo';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { AboutBullsye } from '@/components/landing/AboutBullsye';
import { Reveal } from '@/components/landing/Reveal';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingTicker } from '@/components/landing/LandingTicker';
import { SignupBenefits } from '@/components/landing/SignupBenefits';
import { SignupCta } from '@/components/landing/SignupCta';
import { TodayPicks } from '@/components/landing/TodayPicks';
import { AsistanDemo } from '@/components/landing/AsistanDemo';
import { TerminalCtaButton } from '@/components/landing/TerminalCtaButton';
import {
  TOP_BIST_FOR_HUB,
  TOP_CRYPTO_FOR_HUB,
  TOP_US_FOR_HUB,
} from '@/lib/seo/internal-links';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { SITE_URL } from '@/lib/seo/symbols';

const FAQ = [
  {
    q: 'Analist hedefleri nerede?',
    a: '/targets ve her hisse sayfasındaki konsensüs kutusu. Yatırım tavsiyesi değildir.',
  },
  {
    q: 'Analiz skoru nasıl hesaplanır?',
    a: 'F/K, hacim, RSI/hareketli ortalamalar ve gün içi bant — 0–100.',
  },
  {
    q: 'Ücretsiz mi?',
    a: 'Evet. Terminal, skor ve hedefler kayıt olmadan açılır. Açık beta boyunca hesap da ücretsiz.',
  },
  {
    q: 'Hesap açınca ne değişir?',
    a: 'Hafta içi 08:30 sabah özeti e-postası, alarm e-postası, her cihazda aynı envanter ve verine göre cevap veren asistan.',
  },
  {
    q: 'Portföy asistanı nedir?',
    a: 'Kayıtlı envanterine göre soru-cevap. Al/sat demez. Ücretsiz kayıt gerekir.',
  },
  {
    q: 'Yatırım tavsiyesi verir mi?',
    a: 'Hayır. Veriler bilgilendirme amaçlıdır; karar size aittir.',
  },
] as const;

const PILLARS = [
  {
    href: '/firsatlar',
    icon: Zap,
    title: 'Skor taraması',
    line: '0–100 skor · bant · F/K',
  },
  {
    href: '/targets',
    icon: Crosshair,
    title: 'Hedef fiyatlar',
    line: 'Kurum konsensüsü · prim',
  },
  {
    href: '/portfolio',
    icon: Activity,
    title: 'Envanter',
    line: 'Hisse · nakit · mevduat · alarm',
  },
  {
    href: '/whales',
    icon: Waves,
    title: 'Haber & balina',
    line: 'KAP · akış · takas',
  },
] as const;

export function LandingPage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* JSON-LD inside the page root, not as body children: next-themes
          injects a server-only script at the top of <body>, which would shift
          sibling scripts and break hydration. */}
      <SchemaMarkup />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <LandingNav />

      <section className="relative isolate pt-[calc(6rem+var(--launch-banner-h,0px))]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(20,184,166,0.16), transparent 55%), radial-gradient(ellipse 55% 40% at 90% 30%, rgba(51,65,85,0.4), transparent 50%)',
          }}
        />

        <div className="relative mx-auto flex max-w-6xl flex-col px-4 sm:px-6">
          <div className="landing-grid pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto max-w-3xl pt-6 text-center sm:pt-10">
            <p className="landing-fade-up inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              <span className="size-1.5 rounded-full bg-[var(--accent)]" />
              Bireysel yatırımcı için takip asistanı
            </p>
            <h1 className="landing-fade-up landing-delay-1 mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Piyasayı{' '}
              <span className="text-[var(--accent)]">senin yerine</span> takip ediyoruz
            </h1>
            <p className="landing-fade-up landing-delay-2 mx-auto mt-4 max-w-xl text-balance text-base text-[var(--muted)] sm:text-lg">
              Bullsye BİST, ABD ve kripto piyasalarını her gün tarar, her hisseyi
              anlaşılır bir 0–100 skora indirir ve önemli bir şey olduğunda sana
              haber verir. Karar her zaman senin.
            </p>
            <div className="landing-fade-up landing-delay-3 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <SignupCta where="hero" className="w-full sm:w-auto">
                Hemen kayıt ol
              </SignupCta>
              <TerminalCtaButton
                compact
                className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--border)] px-5 py-3 text-sm font-medium hover:border-[var(--accent)]/40 sm:w-auto"
              >
                Kayıtsız terminale gir
              </TerminalCtaButton>
            </div>
            <p className="landing-fade-up landing-delay-3 mt-4 text-sm text-[var(--muted)]">
              Hesap oluştur: sabah özeti, fiyat alarmı ve izleme listen her cihazda seninle.
            </p>
          </div>
          <HeroDemo />
        </div>
      </section>

      <div className="mt-10">
        <LandingTicker />
      </div>

      <AboutBullsye />

      <Reveal>
        <TodayPicks />
      </Reveal>

      <HowItWorks />

      <Reveal>
        <SignupBenefits />
      </Reveal>

      <Reveal>
        <AsistanDemo />
      </Reveal>

      <section
        id="ozellikler"
        className="scroll-mt-20 border-b border-[var(--border)] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Kayıtsız açık araçlar
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="group flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--accent)]/40"
                >
                  <p.icon className="size-5 text-[var(--accent)]" />
                  <h3 className="mt-3 text-sm font-semibold group-hover:text-[var(--accent)]">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">{p.line}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="skor-kontrol"
        className="scroll-mt-20 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-center text-xl font-semibold tracking-tight sm:text-2xl">
            Merak ettiğin sembolün skoruna bak
          </h2>
          <AssetChecker />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight">Semboller</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              BİST
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {TOP_BIST_FOR_HUB.map((sym) => (
                <li key={sym}>
                  <Link
                    href={`/bist/${sym}`}
                    className="inline-block rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--accent)] hover:border-[var(--accent)]/40"
                  >
                    {sym}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              NASDAQ
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {TOP_US_FOR_HUB.map((sym) => (
                <li key={sym}>
                  <Link
                    href={`/nasdaq/${sym}`}
                    className="inline-block rounded-md border border-[var(--border)] px-2 py-1 text-xs text-sky-300 hover:border-sky-400/40"
                  >
                    {sym}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Kripto
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {TOP_CRYPTO_FOR_HUB.map((sym) => (
                <li key={sym}>
                  <Link
                    href={`/kripto/${sym}`}
                    className="inline-block rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--up)] hover:border-[var(--up)]/40"
                  >
                    {sym.replace('USDT', '')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="sss"
        className="scroll-mt-20 border-t border-[var(--border)] bg-[var(--surface)]/40 py-16"
      >
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="text-center text-xl font-semibold tracking-tight">
            SSS
          </h2>
          <div className="mt-8">
            <FaqAccordion items={FAQ} />
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-t border-[var(--border)] py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 60% 70% at 50% 100%, rgba(20,184,166,0.18), transparent 60%)',
          }}
        />
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-4xl">
            Yarın sabah piyasaya hazır uyan.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--muted)] sm:text-base">
            Hesabını aç, sabah özetini aç. 08:30’da günün en yüksek skorları
            e-postanda olsun.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <SignupCta where="final" className="w-full sm:w-auto" />
            <Link
              href="/firsatlar"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Önce taramaya bak →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)]/80 py-8">
        <div className="mx-auto max-w-6xl space-y-4 px-4 text-xs text-[var(--muted)] sm:px-6">
          <p className="flex items-start gap-2">
            <Newspaper className="mt-0.5 size-3.5 shrink-0 text-[var(--accent)]" />
            Yatırım tavsiyesi değildir. Karar size aittir.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Bullsye ·{' '}
              {SITE_URL.replace('https://', '')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/terminal" className="hover:text-[var(--accent)]">
                Terminal
              </Link>
              <Link href="/yatirim-uyarisi" className="hover:text-[var(--accent)]">
                Uyarı
              </Link>
              <Link href="/kvkk" className="hover:text-[var(--accent)]">
                KVKK
              </Link>
              <Link href="/gizlilik" className="hover:text-[var(--accent)]">
                Gizlilik
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
