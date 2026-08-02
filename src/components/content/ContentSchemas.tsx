import { SITE_URL } from '@/lib/seo/symbols';
import type { BlogPost, EducationLesson } from '@/content/types';

export function CourseSchema({
  lesson,
  path,
}: {
  lesson: EducationLesson;
  path: string;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: lesson.title,
    description: lesson.description,
    provider: {
      '@type': 'Organization',
      name: 'Bullsye',
      sameAs: SITE_URL,
    },
    url: `${SITE_URL}${path}`,
    inLanguage: 'tr-TR',
    educationalLevel: lesson.level,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function HowToSchema({ lesson }: { lesson: EducationLesson }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: lesson.title,
    description: lesson.description,
    step: lesson.sections.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.heading,
      text: s.paragraphs.join(' '),
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ArticleSchema({
  post,
  path,
}: {
  post: BlogPost | EducationLesson;
  path: string;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'Bullsye Araştırma Ekibi',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bullsye',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon` },
    },
    mainEntityOfPage: `${SITE_URL}${path}`,
    inLanguage: 'tr-TR',
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ContentFaqSchema({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  if (!faqs.length) return null;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
