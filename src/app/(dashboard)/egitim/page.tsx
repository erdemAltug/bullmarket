import type { Metadata } from 'next';
import Link from 'next/link';
import {
  EDUCATION_CATEGORIES,
  EDUCATION_LESSONS,
  estimateDescription,
  estimateTitle,
} from '@/content/academy';
import { LevelBadge } from '@/components/content/ArticleChrome';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: estimateTitle('Finansal Okuryazarlık Eğitim Hub\'ı | Bullsye Akademi'),
  description: estimateDescription(
    'Borsa, temettü, F/K, RSI, Golden Cross ve kripto risk yönetimi dersleri. Bullsye Eğitim Hub\'ı ile finansal okuryazarlığınızı geliştirin.'
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
    title: 'Bullsye Eğitim Hub\'ı — Borsa & Finans Akademisi',
    description:
      'Adım adım borsa, teknik analiz ve kripto risk yönetimi dersleri.',
    url: `${SITE_URL}/egitim`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/api/og?symbol=EGITIM&price=Akademi&change=LIVE&label=Bullsye%20Academy`,
        width: 1200,
        height: 630,
        alt: 'Bullsye Eğitim Hub',
      },
    ],
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
          Finansal Okuryazarlık Eğitim Hub&apos;ı
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Borsa temelleri, teknik analiz ve kripto risk yönetimi — her ders
          canlı Bullsye araçlarına bağlanır. Okuyun, uygulayın, terminalde
          doğrulayın.
        </p>
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
