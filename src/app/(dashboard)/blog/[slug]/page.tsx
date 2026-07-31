import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BLOG_POSTS,
  estimateDescription,
  estimateTitle,
  getBlogPost,
} from '@/content/academy';
import {
  ArticleBody,
  ArticleMeta,
  ArticleToc,
  AuthorBio,
  FaqBlock,
  ReadingProgressBar,
} from '@/components/content/ArticleChrome';
import {
  ArticleSchema,
  BreadcrumbSchema,
  ContentFaqSchema,
} from '@/components/content/ContentSchemas';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: 'Yazı bulunamadı' };

  const path = `/blog/${slug}`;
  const title = estimateTitle(post.title);
  const description = estimateDescription(post.description);
  const og = `${SITE_URL}/api/og?symbol=BLOG&price=${encodeURIComponent(slug.slice(0, 10))}&change=SEO&label=Bullsye%20Blog`;

  return {
    title,
    description,
    keywords: post.keywords,
    alternates: withLangAlternates(path),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [{ url: og, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [og],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const path = `/blog/${slug}`;

  return (
    <>
      <ReadingProgressBar />
      <ArticleSchema post={post} path={path} />
      <ContentFaqSchema faqs={post.faqs} />
      <BreadcrumbSchema
        items={[
          { name: 'Bullsye', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path },
        ]}
      />

      <article className="mx-auto max-w-5xl">
        <nav className="mb-4 text-xs text-zinc-500">
          <Link href="/blog" className="hover:text-emerald-400">
            Blog
          </Link>
          <span className="mx-1.5">/</span>
          <span className="line-clamp-1">{post.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <ArticleToc sections={post.sections} />
          <div>
            <header className="mb-8 space-y-3">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-500"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
                {post.title}
              </h1>
              <p className="text-sm leading-relaxed text-zinc-400">
                {post.description}
              </p>
              <ArticleMeta
                minutes={post.readingMinutes}
                date={post.updatedAt}
              />
            </header>

            <ArticleBody sections={post.sections} cta={post.toolCta} />
            <FaqBlock faqs={post.faqs} />
            <AuthorBio />

            <div className="mt-8 text-sm">
              <Link href="/blog" className="text-emerald-400 hover:underline">
                ← Tüm yazılar
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
