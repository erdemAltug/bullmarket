import Image from 'next/image';
import Link from 'next/link';
import {
  Activity,
  Crosshair,
  Newspaper,
  Smartphone,
  Waves,
  Zap,
} from 'lucide-react';
import { AssetChecker } from '@/components/landing/AssetChecker';
import { FaqAccordion } from '@/components/landing/FaqAccordion';
import { HeroLiveBadges } from '@/components/landing/HeroLiveBadges';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingTicker } from '@/components/landing/LandingTicker';
import { WhyAssistant } from '@/components/landing/WhyAssistant';
import { InventoryPitch } from '@/components/landing/InventoryPitch';
import { TerminalCtaButton } from '@/components/landing/TerminalCtaButton';
import {
  TOP_BIST_FOR_HUB,
  TOP_CRYPTO_FOR_HUB,
  TOP_US_FOR_HUB,
} from '@/lib/seo/internal-links';
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
    a: 'Evet. Terminal, skor ve hedefler kayıt olmadan açılır.',
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

        <div className="mx-auto flex max-w-6xl flex-col px-4 sm:px-6">
          <div className="mx-auto max-w-2xl pt-6 text-center sm:pt-10">
            <p className="landing-fade-up text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Bullsye
            </p>
            <h1 className="landing-fade-up landing-delay-1 mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl md:text-5xl">
              BİST · NASDAQ · Kripto
            </h1>
            <p className="landing-fade-up landing-delay-2 mx-auto mt-4 max-w-md text-sm text-[var(--muted)] sm:text-base">
              Skor, hedef fiyat ve envanter — tek terminal.
            </p>
            <div className="landing-fade-up landing-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
              <TerminalCtaButton>Terminal</TerminalCtaButton>
              <Link
                href="/firsatlar"
                className="inline-flex items-center rounded-lg border border-[var(--border)] px-5 py-3 text-sm font-medium hover:border-[var(--accent)]/40"
              >
                Skor taraması
              </Link>
            </div>
          </div>

          <div className="landing-fade-up landing-delay-4 relative mx-auto mt-12 w-full max-w-5xl sm:mt-14">
            <div className="landing-float relative overflow-hidden rounded-2xl border border-[var(--accent)]/25 bg-[var(--surface)] shadow-[0_0_60px_rgba(20,184,166,0.12)]">
              <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-[#f43f5e]/70" />
                <span className="size-2.5 rounded-full bg-amber-400/70" />
                <span className="size-2.5 rounded-full bg-[var(--accent)]/70" />
                <span className="ml-3 font-mono text-[10px] tracking-wider text-[var(--muted)]">
                  bullsye.app/terminal
                </span>
              </div>
              <div className="relative space-y-3 p-3 sm:p-4">
                <HeroLiveBadges />
                <div className="relative overflow-hidden rounded-xl border border-[var(--border)]">
                  <Image
                    src="/images/landing/terminal-hero.png"
                    alt="Bullsye terminal"
                    width={1024}
                    height={490}
                    priority
                    className="h-auto w-full object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 1024px"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--surface)] to-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10">
        <LandingTicker />
      </div>

      <WhyAssistant />

      <section
        id="ozellikler"
        className="scroll-mt-20 border-b border-[var(--border)] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Modüller
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

      <InventoryPitch />

      <section
        id="skor-kontrol"
        className="scroll-mt-20 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Skor
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Sembol yaz · skor ve fiyat.
            </p>
          </div>
          <AssetChecker />
        </div>
      </section>

      <section
        id="uygulama"
        className="scroll-mt-20 border-y border-[var(--border)] bg-[var(--surface)]/50 py-12"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <Smartphone className="size-6 shrink-0 text-[var(--accent)]" />
          <p className="flex-1 text-sm text-[var(--muted)]">
            Mobil uygulama yakında · web terminal mobil uyumlu
          </p>
          <TerminalCtaButton>Terminal</TerminalCtaButton>
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

      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">Terminal</h2>
        <TerminalCtaButton className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#042f2e] hover:brightness-110">
          Aç
        </TerminalCtaButton>
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
