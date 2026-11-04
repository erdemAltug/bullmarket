import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS } from '@/content/academy';
import { groupPostsByTopic } from '@/lib/content/blog-topics';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { hubOgImages } from '@/lib/seo/og';
import { Newspaper } from 'lucide-react';

const TITLE = 'Borsa Blogu: Hisse Analizi, Temettü ve Yatırım Rehberleri';
const DESCRIPTION =
  'Hisse nasıl analiz edilir, temettü vergisi ne kadar, VİOP ve açığa satış nedir? Sade Türkçe borsa ve yatırım rehberleri, her biri canlı verilerle.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: withLangAlternates('/blog'),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/blog`,
    type: 'website',
    images: hubOgImages('Borsa Blogu', 'Hisse analizi, temettü ve yatırım rehberleri'),
  },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(+d)
    ? ''
    : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogIndexPage() {
  const byDate = [...BLOG_POSTS].sort(
    (a, b) => +new Date(b.updatedAt || b.publishedAt) - +new Date(a.updatedAt || a.publishedAt)
  );
  const latest = byDate.slice(0, 3);
  const groups = groupPostsByTopic(BLOG_POSTS);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header className="space-y-3">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <Newspaper className="size-4" />
          Bullsye Blog
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Borsa ve yatırım rehberleri
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Hisse analizinden temettü vergisine, VİOP&apos;tan portföy kurmaya:
          yatırımcıların en çok sorduğu {BLOG_POSTS.length} soruya sade
          Türkçe cevaplar. Temel kavramlar için{' '}
          <Link href="/egitim" className="font-medium text-[var(--accent)] hover:underline">
            Eğitim merkezine
          </Link>{' '}
          bakın.
        </p>
        <nav aria-label="Konular" className="flex flex-wrap gap-2 pt-1">
          {groups.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
            >
              {g.title}
            </a>
          ))}
        </nav>
      </header>

      <section aria-labelledby="yeni" className="space-y-3">
        <h2 id="yeni" className="text-lg font-semibold">Yeni yazılar</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {latest.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--accent)]"
              >
                <span className="text-[11px] text-[var(--muted)]">
                  {formatDate(post.updatedAt || post.publishedAt)} · {post.readingMinutes} dk
                </span>
                <span className="mt-1.5 text-sm font-semibold leading-snug">{post.title}</span>
                <span className="mt-1 line-clamp-3 text-xs text-[var(--muted)]">{post.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {groups.map((g) => (
        <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="scroll-mt-20 space-y-3">
          <div>
            <h2 id={`${g.id}-h`} className="text-lg font-semibold">{g.title}</h2>
            <p className="text-sm text-[var(--muted)]">{g.blurb}</p>
          </div>
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--card)]">
            {g.items.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block px-4 py-3 transition-colors hover:bg-[var(--background)]"
                >
                  <span className="block text-sm font-medium">{post.title}</span>
                  <span className="mt-0.5 block line-clamp-1 text-xs text-[var(--muted)]">
                    {post.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <aside className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-sm font-semibold">Okuduğunu canlı veride dene</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Hisselerin analiz skoru, hedef fiyatı ve teknik sinyalleri ücretsiz.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/firsatlar" className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-black">
            Fırsat masası
          </Link>
          <Link href="/targets" className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium">
            Hedef fiyatlar
          </Link>
          <Link href="/dividends" className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium">
            Temettü takvimi
          </Link>
        </div>
      </aside>
    </div>
  );
}
