import Image from 'next/image';
import Link from 'next/link';
import {
  Activity,
  Bot,
  Crosshair,
  Newspaper,
  Smartphone,
  Sparkles,
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
    q: 'Analist tavsiyeleri ve hedef fiyatları nerede?',
    a: 'Ücretsiz Hedef Fiyatlar sayfasında BİST kurum konsensüsü, ortalama/yüksek/düşük hedef ve potansiyel prim yer alır. Her hisse karnesinde de aynı kutu vardır. Yatırım tavsiyesi değildir.',
  },
  {
    q: 'Bullsye AI Fırsat Skoru neye göre hesaplanır?',
    a: 'Canlı F/K rasyoları, 24 saatlik hacim ivmesi, teknik indikatörler (RSI, hareketli ortalamalar) ve gün içi bant pozisyonlarının ağırlıklı algoritmasıyla 100 üzerinden hesaplanır.',
  },
  {
    q: 'Kişisel envanter nedir? Neden kayıt?',
    a: 'Hisse, nakit, mevduat ve alarm tek sayfada. Tarayıcıda kayıtsız denersin. Kayıt, aynı envanteri başka cihazda kaybetmemek içindir — terminali kilitlemek için değil.',
  },
  {
    q: 'Bullsye terminalini kullanmak ücretsiz mi?',
    a: 'Evet. Canlı borsa verilerini, fırsat skorlarını ve analist hedef fiyatlarını ücretsiz terminal üzerinden takip edebilirsiniz.',
  },
  {
    q: 'Hangi borsaların verileri yer alıyor?',
    a: 'BİST 100, NASDAQ, S&P 500, Kripto (Binance) ve TEFAS yatırım fonları canlı olarak taranmaktadır.',
  },
  {
    q: 'Bullsye yatırım tavsiyesi verir mi?',
    a: "Hayır. Bullsye'da yer alan hiçbir veri yatırım tavsiyesi niteliğinde değildir. Kararlarınızı kendi araştırmanız ve risk profilinizle alın.",
  },
] as const;

const PILLARS = [
  {
    href: '/firsatlar',
    icon: Zap,
    title: 'AI Fırsat Radarı',
    subtitle: 'Karmaşaya son verin',
    bullets: [
      {
        t: '100 üzerinden net büyüme skoru',
        d: 'Yüzlerce indikatörü saatlerce incelemek yerine her varlık için anlık potansiyel skorunu (örn. 90/100) görün.',
      },
      {
        t: 'Zirve ve dip bandı analizi',
        d: 'Gün içi dip/zirve uzaklığını yüzdesel hesaplayın; tepki noktalarını yakalayın.',
      },
      {
        t: 'Neden bu varlık?',
        d: 'Algoritmanın öne çıkarma gerekçelerini 3 net satırda görün (F/K iskontosu, hacim patlaması…).',
      },
    ],
  },
  {
    href: '/targets',
    icon: Crosshair,
    title: '12 Aylık Analist Hedefleri',
    subtitle: 'Kurumsal akıl',
    bullets: [
      {
        t: 'Aracı kurum konsensüsü',
        d: 'Kurumların 12 aylık hedef fiyatları ve AL / TUT dağılımını tek ekranda toplayın.',
      },
      {
        t: 'Potansiyel prim oranı',
        d: 'Güncel fiyat ile konsensüs hedefi arasındaki yükseliş potansiyelini (örn. +%42) anında görün.',
      },
    ],
  },
  {
    href: '/portfolio',
    icon: Activity,
    title: 'Finans Envanteri',
    subtitle: 'Kişisel envanter',
    bullets: [
      {
        t: 'Hisse, nakit, mevduat, alarm',
        d: 'Grafik her yerde var. Senin lotun, faizin ve hedef alarmın tek sayfada.',
      },
      {
        t: 'Sana özel özet',
        d: 'Genel piyasa cümlesi değil; envanterinden kural tabanlı hatırlatma. Tavsiye değil.',
      },
    ],
  },
  {
    href: '/whales',
    icon: Waves,
    title: 'Haber, KAP & Balina',
    subtitle: 'Canlı takip akışı',
    bullets: [
      {
        t: 'Anlık şirket gelişmeleri',
        d: 'Kritik haber ve bilanço notlarını kısa AI özetleriyle okuyun.',
      },
      {
        t: 'Kripto balina radar',
        d: 'Büyük cüzdan hareketlerini ve kurumsal takas değişimlerini canlı izleyin.',
      },
    ],
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

      {/* Hero */}
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
          <div className="mx-auto max-w-3xl pt-4 text-center sm:pt-8">
            <p className="landing-fade-up landing-pill-glow mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--accent)]/35 bg-[var(--glow-up)] px-3 py-1.5 text-[11px] font-semibold text-[var(--accent)] sm:text-xs">
              <Sparkles className="size-3.5 shrink-0" />
              <span className="truncate">
                Yapay Zeka v2.4 yayında — BİST, NASDAQ ve Kripto radarı canlı
              </span>
            </p>

            <h1 className="landing-fade-up landing-delay-1 mt-5 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
              Piyasayı izle, envanterini unutma.{' '}
              <span className="text-[var(--accent)]">
                Kişisel finans asistanı
              </span>{' '}
              hisse, nakit ve alarmı bir arada tutar.
            </h1>

            <p className="landing-fade-up landing-delay-2 mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              BİST tarama ve fırsat skoru ücretsiz. Fark: senin lotun, mevduatın
              ve hedef alarmın — kayıt, bunları hesabına yazmak içindir.
            </p>

            <div className="landing-fade-up landing-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
              <TerminalCtaButton>Canlı Terminale Geç</TerminalCtaButton>
              <Link
                href="#uygulama"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
              >
                <Smartphone className="size-4" />
                iOS / Android
              </Link>
            </div>
            <p className="landing-fade-up landing-delay-3 mt-3 text-[11px] text-[var(--muted)]">
              Kredi kartı yok · Terminal ücretsiz · Kayıt = envanter senkronu
            </p>
          </div>

          {/* Terminal preview frame */}
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
                    alt="Bullsye canlı terminal önizlemesi — fırsat radarı ve skor kartları"
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

                <div className="absolute bottom-6 left-4 right-4 sm:bottom-8 sm:left-auto sm:right-6 sm:max-w-sm">
                  <div className="flex gap-2 rounded-xl border border-[var(--accent)]/30 bg-[var(--popover-bg)]/95 p-3 shadow-lg backdrop-blur-md">
                    <Bot className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" />
                    <p className="text-xs leading-relaxed text-[var(--foreground)]">
                      <span className="font-semibold text-[var(--accent)]">
                        Bullsye AI:
                      </span>{' '}
                      AKBNK son 24 saatte güçlü hacim kırılımı tespit etti.
                    </p>
                  </div>
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

      {/* Value pillars */}
      <section
        id="ozellikler"
        className="scroll-mt-20 border-b border-[var(--border)] py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Terminalde neler var?
            </h2>
            <p className="mt-3 text-[var(--muted)]">
              AI skor, analist hedefleri, portföy riski ve haber/balina akışı.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 lg:grid-cols-2">
            {PILLARS.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="group flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-[var(--accent)]/40 sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--accent)]/30 bg-[var(--glow-up)]">
                      <p.icon className="size-5 text-[var(--accent)]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold group-hover:text-[var(--accent)]">
                        {p.title}
                      </h3>
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                        {p.subtitle}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {p.bullets.map((b) => (
                      <li key={b.t} className="text-sm leading-relaxed">
                        <p className="font-semibold text-[var(--foreground)]">
                          {b.t}
                        </p>
                        <p className="mt-0.5 text-[var(--muted)]">{b.d}</p>
                      </li>
                    ))}
                  </ul>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <InventoryPitch />

      {/* SEO quick checker */}
      <section
        id="skor-kontrol"
        className="scroll-mt-20 mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Giriş yapmadan AI skorunu dene
            </h2>
            <p className="mt-4 leading-relaxed text-[var(--muted)]">
              THYAO, GARAN veya BTC yazın — canlı evrenden skor, fiyat ve değişim
              anında gelir. Beğendiyseniz tek tıkla terminale geçin.
            </p>
            <TerminalCtaButton
              compact
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Canlı Terminale Geç
            </TerminalCtaButton>
          </div>
          <AssetChecker />
        </div>
      </section>

      {/* App section */}
      <section
        id="uygulama"
        className="scroll-mt-20 border-y border-[var(--border)] bg-[var(--surface)]/50 py-16 sm:py-20"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center sm:px-6 md:flex-row md:text-left">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl border border-[var(--accent)]/30 bg-[var(--glow-up)]">
            <Smartphone className="size-7 text-[var(--accent)]" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              iOS / Android uygulaması yakında
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
              Mobil bildirim ve alarm senkronu üzerinde çalışıyoruz. Şimdilik web
              terminali telefonda da çalışır — favorilere ekleyin.
            </p>
          </div>
          <TerminalCtaButton>Web terminalini aç</TerminalCtaButton>
        </div>
      </section>

      {/* Symbol SEO */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          Popüler analiz sayfaları
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Canlı fiyat, grafik ve sağlık karnesi — doğrudan detaya gidin.
        </p>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold">BİST</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {TOP_BIST_FOR_HUB.map((sym) => (
                <li key={sym}>
                  <Link
                    href={`/bist/${sym}`}
                    className="inline-block rounded-md border border-[var(--border)] px-2.5 py-1 text-sm text-[var(--accent)] hover:border-[var(--accent)]/40"
                  >
                    {sym}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">NASDAQ</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {TOP_US_FOR_HUB.map((sym) => (
                <li key={sym}>
                  <Link
                    href={`/us/${sym}`}
                    className="inline-block rounded-md border border-[var(--border)] px-2.5 py-1 text-sm text-sky-300 hover:border-sky-400/40"
                  >
                    {sym}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Kripto</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {TOP_CRYPTO_FOR_HUB.map((sym) => (
                <li key={sym}>
                  <Link
                    href={`/crypto/${sym}`}
                    className="inline-block rounded-md border border-[var(--border)] px-2.5 py-1 text-sm text-[var(--up)] hover:border-[var(--up)]/40"
                  >
                    {sym.replace('USDT', '')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="sss"
        className="scroll-mt-20 border-t border-[var(--border)] bg-[var(--surface)]/40 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight">
            Sık sorulanlar
          </h2>
          <div className="mt-10">
            <FaqAccordion items={FAQ} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          10 saniyede keşfedin
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[var(--muted)]">
          Ücretsiz canlı veriler — kredi kartı yok. AI skor, hedef fiyat ve
          balina akışı hazır.
        </p>
        <TerminalCtaButton className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-bold text-[#042f2e] shadow-[0_0_28px_rgba(20,184,166,0.28)] hover:brightness-110">
          Canlı Terminale Geç
        </TerminalCtaButton>
      </section>

      {/* YMYL / E-E-A-T footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]/80 py-10">
        <div className="mx-auto max-w-6xl space-y-6 px-4 text-xs leading-relaxed text-[var(--muted)] sm:px-6">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="flex items-start gap-2 font-semibold text-[var(--foreground)]">
              <Newspaper className="mt-0.5 size-3.5 shrink-0 text-[var(--accent)]" />
              Yatırım uyarısı (YMYL)
            </p>
            <p className="mt-2">
              Bullsye&apos;da yer alan hiçbir veri yatırım tavsiyesi niteliğinde
              değildir. Fiyatlar, AI skorları ve analist hedefleri bilgilendirme
              amaçlıdır; kararlarınızı kendi araştırmanız ve risk toleransınızla
              alın. Metodoloji: canlı F/K, hacim ivmesi, gün içi bant ve teknik
              ortalamalar ağırlıklı skorlama.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Bullsye · {SITE_URL.replace('https://', '')}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/terminal" className="hover:text-[var(--accent)]">
                Terminal
              </Link>
              <Link href="/sitemap.xml" className="hover:text-[var(--accent)]">
                Sitemap
              </Link>
              <Link href="/yatirim-uyarisi" className="hover:text-[var(--accent)]">
                Yatırım uyarısı
              </Link>
              <Link href="/kvkk" className="hover:text-[var(--accent)]">
                KVKK
              </Link>
              <Link href="/gizlilik" className="hover:text-[var(--accent)]">
                Gizlilik
              </Link>
              <Link href="/kosullar" className="hover:text-[var(--accent)]">
                Koşullar
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
