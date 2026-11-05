import type { Metadata } from 'next';
import Link from 'next/link';
import {
  EDUCATION_CATEGORIES,
  EDUCATION_LESSONS,
  estimateDescription,
} from '@/content/academy';
import { LevelBadge } from '@/components/content/ArticleChrome';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { hubOgImages } from '@/lib/seo/og';
import { GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: { absolute: 'Ücretsiz Borsa Eğitimi: Sıfırdan Hisse, Fon ve Teknik Analiz' },
  description: estimateDescription(
    'Hisse nasıl alınır, halka arza nasıl katılınır, F/K ve PD/DD nedir, MACD nasıl okunur? Sıfırdan ileri seviyeye ücretsiz, Türkçe borsa dersleri.'
  ),
  keywords: [
    'borsa eğitimi',
    'finansal okuryazarlık',
    'RSI nedir',
    'temettü nedir',
    'teknik analiz eğitimi',
  ],
  alternates: withLangAlternates('/egitim'),
  openGraph: {
    title: 'Ücretsiz Borsa Eğitimi | Bullsye Akademi',
    description:
      'Sıfırdan borsa, temel ve teknik analiz, fonlar ve risk yönetimi dersleri.',
    url: `${SITE_URL}/egitim`,
    type: 'website',
    images: hubOgImages('Ücretsiz Borsa Eğitimi', 'Sıfırdan hisse, fon ve teknik analiz dersleri'),
  },
};

export default function EgitimHubPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header className="space-y-3">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <GraduationCap className="size-4" />
          Bullsye Akademi
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ücretsiz borsa eğitimi
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          {EDUCATION_LESSONS.length} ders, sıfırdan ileri seviyeye. Her ders
          sade Türkçe anlatılır ve öğrendiğinizi hemen deneyebileceğiniz canlı
          bir Bullsye aracına bağlanır.
        </p>
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-sm">
          <p className="font-semibold text-zinc-100">Yeni misiniz? Bu sırayla başlayın:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-zinc-300">
            <li><Link className="hover:text-emerald-400" href="/egitim/borsa-temelleri/borsa-nasil-oynanir">Borsa nasıl oynanır?</Link></li>
            <li><Link className="hover:text-emerald-400" href="/egitim/borsa-temelleri/hisse-senedi-nasil-alinir">Hisse senedi nasıl alınır?</Link></li>
            <li><Link className="hover:text-emerald-400" href="/egitim/borsa-temelleri/fk-orani-nedir">F/K oranı nedir?</Link></li>
            <li><Link className="hover:text-emerald-400" href="/egitim/borsa-temelleri/temettu-nedir-nasil-alinir">Temettü nasıl alınır?</Link></li>
            <li><Link className="hover:text-emerald-400" href="/egitim/teknik-analiz/rsi-indikatoru-nedir">RSI nedir?</Link></li>
          </ol>
        </div>
        <Link
          href="/blog"
          className="inline-block text-sm font-medium text-emerald-400 hover:underline"
        >
          Piyasa blog yazılarına göz atın →
        </Link>
      </header>

      {EDUCATION_CATEGORIES.map((cat) => {
        const lessons = EDUCATION_LESSONS.filter((l) => l.category === cat.slug);
        return (
          <section key={cat.slug} className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{cat.title}</h2>
              <p className="mt-1 text-sm text-zinc-500">{cat.description}</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {lessons.map((lesson) => (
                <li key={lesson.slug}>
                  <Link
                    href={`/egitim/${lesson.category}/${lesson.slug}`}
                    className="block h-full rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 transition-colors hover:border-emerald-500/40"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <LevelBadge level={lesson.level} />
                      <span className="text-[11px] text-zinc-500">
                        {lesson.readingMinutes} dk
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-100">
                      {lesson.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                      {lesson.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <aside className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-transparent p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Öğrendiklerinizi uygulayın
        </p>
        <p className="mt-2 text-sm text-zinc-300">
          Ders bitince terminale dönün — skor, sinyal ve fon masası aynı günün
          verisiyle bekliyor.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/firsatlar"
            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-400"
          >
            Skor taraması
          </Link>
          <Link
            href="/signals"
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-emerald-500/40"
          >
            Sinyaller
          </Link>
          <Link
            href="/fon"
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-emerald-500/40"
          >
            Fonlar & ETF
          </Link>
          <Link
            href="/blog/bullsye-gunluk-rutin-rehberi"
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-emerald-500/40"
          >
            10 dk rutin
          </Link>
        </div>
      </aside>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Bullsye Eğitim Hub\'ı',
            url: `${SITE_URL}/egitim`,
            hasPart: EDUCATION_LESSONS.map((l) => ({
              '@type': 'Course',
              name: l.title,
              url: `${SITE_URL}/egitim/${l.category}/${l.slug}`,
            })),
          }),
        }}
      />
    </div>
  );
}
