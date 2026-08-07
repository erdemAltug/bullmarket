import Image from 'next/image';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Crosshair,
  GitCompare,
  LineChart,
  Zap,
} from 'lucide-react';
import { AssetChecker } from '@/components/landing/AssetChecker';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingTicker } from '@/components/landing/LandingTicker';
import {
  TOP_BIST_FOR_HUB,
  TOP_CRYPTO_FOR_HUB,
  TOP_US_FOR_HUB,
} from '@/lib/seo/internal-links';

const FAQ = [
  {
    q: 'Bullsye ile BİST hisse analizi nasıl yapılır?',
    a: 'Hisse sayfasında canlı fiyat, AI sağlık karnesi, F/K–PD/DD, analist hedef fiyatları ve kurum yorumlarını tek ekranda görürsünüz. Terminale girip BİST veya arama ile başlayın.',
  },
  {
    q: 'Alım fırsatları ve AI sinyaller gerçek zamanlı mı?',
    a: 'Evet. Fırsat masası ve sinyal radarı canlı tarama skorları, gün içi bant ve hacim ivmesiyle güncellenir. Alarm kurarak kaçırmadan takip edebilirsiniz.',
  },
  {
    q: 'Temettü takvimi ve NASDAQ analizi ücretsiz mi?',
    a: 'Temel terminal, BİST/NASDAQ/kripto canlı fiyatlar, temettü karnesi ve eğitim içerikleri ücretsizdir. Hesap ile watchlist ve alarmlar senkronlanır.',
  },
  {
    q: 'Bullsye yatırım tavsiyesi verir mi?',
    a: 'Hayır. Bullsye bir analiz terminalidir; yatırım tavsiyesi değildir. Kararlarınızı kendi araştırmanız ve risk profilinizle alın.',
  },
] as const;

const FEATURES = [
  {
    href: '/firsatlar',
    icon: Zap,
    title: 'AI Fırsat Radarı',
    desc: 'Canlı F/K, hacim ve bant analizine dayalı 100 üzerinden otomatik potansiyel skorlama.',
  },
  {
    href: '/targets',
    icon: Crosshair,
    title: 'Analist Hedef Fiyatları',
    desc: 'Aracı kurumların 12 aylık hedef fiyat konsensüsleri ve potansiyel prim oranları.',
  },
  {
    href: '/compare',
    icon: GitCompare,
    title: 'Multi-Asset Kıyaslama (1v1)',
    desc: 'İki hisse veya kripto varlığı kafa kafaya çarpanlarıyla karşılaştırma motoru.',
  },
  {
    href: '/portfolio-audit',
    icon: Activity,
    title: 'AI Portföy Doktoru',
    desc: 'Risk yoğunlaşmasını tespit eden ve sektör dağılım önerisi sunan akıllı tarayıcı.',
  },
] as const;

const HERO_BADGES = [
  { label: 'THYAO', hint: 'BİST' },
  { label: 'GARAN', hint: 'BİST' },
  { label: 'BTC', hint: 'Kripto' },
  { label: 'NVDA', hint: 'NASDAQ' },
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

      <section className="relative isolate pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(20,184,166,0.14), transparent 55%), radial-gradient(ellipse 60% 40% at 85% 40%, rgba(51,65,85,0.35), transparent 50%)',
          }}
        />

        <div className="mx-auto flex max-w-6xl flex-col px-4 sm:px-6">
          <div className="mx-auto max-w-3xl pt-6 text-center sm:pt-10">
            <p className="landing-fade-up text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
              Bullsye · HIT THE MARKET
            </p>
            <h1 className="landing-fade-up landing-delay-1 mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-5xl md:text-[3.25rem] md:leading-[1.1]">
              Yapay Zeka Destekli Canlı Piyasa &amp; Borsa Terminali
            </h1>
            <p className="landing-fade-up landing-delay-2 mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              BİST 100, NASDAQ, Kripto ve Fon piyasalarını anlık verilerle takip
              edin. Yapay zeka skorları ve analist hedef fiyatları ile
              kararlarınızı güçlendirin.
            </p>
            <div className="landing-fade-up landing-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/terminal"
                prefetch
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#042f2e] transition hover:brightness-110"
              >
                Canlı Terminali Aç
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#skor-kontrol"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
              >
                Ücretsiz skor dene
              </Link>
            </div>
            <div className="landing-fade-up landing-delay-3 mt-6 flex flex-wrap items-center justify-center gap-2">
              {HERO_BADGES.map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-2.5 py-1 text-[11px] font-semibold text-[var(--foreground)]"
                >
                  <span className="text-[var(--accent)]">{b.label}</span>
                  <span className="text-[var(--muted)]">{b.hint}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="landing-fade-up landing-delay-4 relative mt-12 sm:mt-14">
            <div className="landing-float relative mx-auto max-w-5xl overflow-hidden rounded-t-2xl border border-b-0 border-[var(--border)] bg-[var(--surface)] shadow-[0_-20px_80px_rgba(20,184,166,0.08)]">
              <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-[#f43f5e]/70" />
                <span className="size-2.5 rounded-full bg-amber-400/70" />
                <span className="size-2.5 rounded-full bg-[var(--accent)]/70" />
                <span className="ml-3 font-mono text-[10px] tracking-wider text-[var(--muted)]">
                  bullsye.app/terminal
                </span>
              </div>
              <Image
                src="/images/landing/terminal-hero.png"
                alt="Bullsye canlı terminal — fırsat radarı, skor kartları ve piyasa genişlik metresi"
                width={1024}
                height={490}
                priority
                className="h-auto w-full object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--background)] to-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      <LandingTicker />

      <section
        id="ozellikler"
        className="scroll-mt-20 border-b border-[var(--border)] bg-[var(--surface)]/40 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Karara dönüşen 4 sütun
            </h2>
            <p className="mt-3 text-[var(--muted)]">
              Soğuk fiyat listesi değil — skor, hedef, kıyas ve portföy sağlığı.
            </p>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.href}>
                <Link
                  href={f.href}
                  className="group flex h-full gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-[var(--accent)]/40"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--accent)]/30 bg-[var(--glow-up)]">
                    <f.icon className="size-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold group-hover:text-[var(--accent)]">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                      {f.desc}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="skor-kontrol"
        className="scroll-mt-20 mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              Try before terminal
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Giriş yapmadan AI fırsat skorunu gör
            </h2>
            <p className="mt-4 text-[var(--muted)] leading-relaxed">
              Canlı evrenden sembol seç; F/K, hacim ve gün içi bant ile üretilen
              0–100 skor anında gelir. Beğendiysen tek tıkla terminale geç.
            </p>
            <Link
              href="/terminal"
              prefetch
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Canlı Terminale Geç
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <AssetChecker />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          Popüler analiz sayfaları
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Canlı fiyat, grafik ve sağlık karnesi — doğrudan hisse / kripto
          detayına gidin.
        </p>
        <div className="mt-8 space-y-8">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <LineChart className="size-4 text-[var(--accent)]" />
              BİST
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {TOP_BIST_FOR_HUB.map((sym) => (
                <li key={sym}>
                  <Link
                    href={`/bist/${sym}`}
                    className="inline-block rounded-md border border-[var(--border)] px-2.5 py-1 text-sm text-[var(--accent)] transition hover:border-[var(--accent)]/40"
                  >
                    {sym}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">NASDAQ / ABD</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {TOP_US_FOR_HUB.map((sym) => (
                <li key={sym}>
                  <Link
                    href={`/us/${sym}`}
                    className="inline-block rounded-md border border-[var(--border)] px-2.5 py-1 text-sm text-sky-300 transition hover:border-sky-400/40"
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
                    className="inline-block rounded-md border border-[var(--border)] px-2.5 py-1 text-sm text-[var(--up)] transition hover:border-[var(--up)]/40"
                  >
                    {sym.replace('USDT', '')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)]/40 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight">
            Sık sorulanlar
          </h2>
          <dl className="mt-10 space-y-8">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="text-base font-semibold">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Piyasayı kaçırmadan izle
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[var(--muted)]">
          Ücretsiz terminal — BİST, fırsat masası, sinyaller ve temettü karnesi
          hazır.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/terminal"
            prefetch
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-bold text-[#042f2e] transition hover:brightness-110"
          >
            Canlı Terminale Geç
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/egitim"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-semibold transition hover:border-[var(--accent)]/40"
          >
            Eğitim Hub
          </Link>
        </div>
        <p className="mt-10 text-[11px] text-[var(--muted)]/80">
          Yatırım tavsiyesi değildir.{' '}
          <Link href="/yatirim-uyarisi" className="underline-offset-2 hover:underline">
            Yatırım uyarısı
          </Link>
        </p>
      </section>

      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Bullsye</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/terminal" className="hover:text-[var(--accent)]">
              Terminal
            </Link>
            <Link href="/tr" className="hover:text-[var(--accent)]">
              TR
            </Link>
            <Link href="/en" className="hover:text-[var(--accent)]">
              EN
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
      </footer>
    </div>
  );
}
