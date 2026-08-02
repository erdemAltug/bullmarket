import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BLOG_POSTS,
  estimateDescription,
  estimateTitle,
} from '@/content/academy';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { Newspaper } from 'lucide-react';

export const metadata: Metadata = {
  title: estimateTitle('Borsa & Finans Blog | Bullsye'),
  description: estimateDescription(
    'BİST analiz checklist\'leri, analist hedef fiyat yorumları ve kripto sinyal rehberleri. Bullsye Blog ile organik finans içeriği.'
  ),
  keywords: [
    'borsa blog',
    'hisse analizi',
    'BİST yorum',
    'finans blog',
    'analist hedef',
  ],
  alternates: withLangAlternates('/blog'),
  openGraph: {
    title: 'Bullsye Blog — Piyasa Analiz & Rehberler',
    description: 'Yüksek niyetli finans aramaları için SEO blog motoru.',
    url: `${SITE_URL}/blog`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/api/og?symbol=BLOG&price=Analiz&change=SEO&label=Bullsye%20Blog`,
        width: 1200,
        height: 630,
        alt: 'Bullsye Blog',
      },
    ],
  },
};

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Newspaper className="size-4" />
          Bullsye Blog
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Piyasa Analiz & Finans Rehberleri
        </h1>
        <p className="text-sm text-zinc-400">
          Featured snippet odaklı makaleler — her yazı canlı terminale CTA ile
          bağlanır.{' '}
          <Link href="/egitim" className="text-emerald-400 hover:underline">
            Eğitim Hub&apos;ı →
          </Link>
        </p>
      </header>

      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="block rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 transition-colors hover:border-emerald-500/40"
            >
              <div className="flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-500"
                  >
                    {t}
                  </span>
                ))}
                <span className="text-[11px] text-zinc-600">
                  {post.readingMinutes} dk
                </span>
              </div>
              <h2 className="mt-2 text-lg font-semibold text-zinc-100">
                {post.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>

      <aside className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
        <p className="text-sm font-semibold text-zinc-100">
          Yazıdan terminale
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Checklist’i canlı araçlarda doğrulayın — içerik tek başına kalmasın.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/firsatlar"
            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-400"
          >
            Fırsat Masası
          </Link>
          <Link
            href="/bist/heatmap"
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-emerald-500/40"
          >
            Isı haritası
          </Link>
          <Link
            href="/signals"
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-emerald-500/40"
          >
            Sinyaller
          </Link>
        </div>
      </aside>
    </div>
  );
}
