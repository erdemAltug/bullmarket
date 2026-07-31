import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  EDUCATION_LESSONS,
  estimateDescription,
  estimateTitle,
  getLesson,
} from '@/content/academy';
import {
  ArticleBody,
  ArticleMeta,
  ArticleToc,
  AuthorBio,
  FaqBlock,
  LevelBadge,
  ReadingProgressBar,
} from '@/components/content/ArticleChrome';
import {
  BreadcrumbSchema,
  ContentFaqSchema,
  CourseSchema,
  HowToSchema,
  ArticleSchema,
} from '@/components/content/ContentSchemas';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

export function generateStaticParams() {
  return EDUCATION_LESSONS.map((l) => ({
    category: l.category,
    slug: l.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const lesson = getLesson(category, slug);
  if (!lesson) return { title: 'Ders bulunamadı' };

  const path = `/egitim/${category}/${slug}`;
  const title = estimateTitle(lesson.title);
  const description = estimateDescription(lesson.description);
  const og = `${SITE_URL}/api/og?symbol=${encodeURIComponent(lesson.slug.slice(0, 12).toUpperCase())}&price=Egitim&change=SEO&label=${encodeURIComponent(lesson.categoryTitle)}`;

  return {
    title,
    description,
    keywords: lesson.keywords,
    alternates: withLangAlternates(path),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      type: 'article',
      publishedTime: lesson.publishedAt,
      modifiedTime: lesson.updatedAt,
      images: [{ url: og, width: 1200, height: 630, alt: lesson.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [og],
    },
  };
}

export default async function EgitimLessonPage({ params }: Props) {
  const { category, slug } = await params;
  const lesson = getLesson(category, slug);
  if (!lesson) notFound();

  const path = `/egitim/${category}/${slug}`;

  return (
    <>
      <ReadingProgressBar />
      <CourseSchema lesson={lesson} path={path} />
      <HowToSchema lesson={lesson} />
      <ArticleSchema post={lesson} path={path} />
      <ContentFaqSchema faqs={lesson.faqs} />
      <BreadcrumbSchema
        items={[
          { name: 'Bullsye', path: '/' },
          { name: 'Eğitim', path: '/egitim' },
          { name: lesson.categoryTitle, path: `/egitim#${category}` },
          { name: lesson.title, path },
        ]}
      />

      <article className="mx-auto max-w-5xl">
        <nav className="mb-4 text-xs text-zinc-500">
          <Link href="/egitim" className="hover:text-emerald-400">
            Eğitim
          </Link>
          <span className="mx-1.5">/</span>
          <span>{lesson.categoryTitle}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <ArticleToc sections={lesson.sections} />
          <div>
            <header className="mb-8 space-y-3">
              <LevelBadge level={lesson.level} />
              <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
                {lesson.title}
              </h1>
              <p className="text-sm leading-relaxed text-zinc-400">
                {lesson.description}
              </p>
              <ArticleMeta
                minutes={lesson.readingMinutes}
                date={lesson.updatedAt}
                level={lesson.level}
              />
            </header>

            <ArticleBody sections={lesson.sections} cta={lesson.toolCta} />
            <FaqBlock faqs={lesson.faqs} />
            <AuthorBio />

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <Link
                href="/egitim"
                className="text-emerald-400 hover:underline"
              >
                ← Tüm dersler
              </Link>
              <Link href="/blog" className="text-zinc-400 hover:text-emerald-400">
                Blog
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
