import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type {
  BlogPost,
  ContentFaq,
  ContentLevel,
  EducationLesson,
  ToolCta,
} from '@/content/types';
import { markdownToSections } from '@/lib/content/md-sections';

const ROOT = path.join(process.cwd(), 'content');

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(String);
}

function asFaqs(v: unknown): ContentFaq[] {
  if (!Array.isArray(v)) return [];
  return v.map((item) => {
    const o = item as Record<string, unknown>;
    return {
      question: String(o.question ?? ''),
      answer: String(o.answer ?? ''),
    };
  });
}

function asToolCta(v: unknown): ToolCta {
  const o = (v ?? {}) as Record<string, unknown>;
  return {
    href: String(o.href ?? '/terminal'),
    label: String(o.label ?? 'Terminale git'),
    blurb: String(o.blurb ?? ''),
  };
}

function readDirMd(...dirs: string[]): string[] {
  const files: string[] = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.md') || f.endsWith('.mdx')) {
        files.push(path.join(dir, f));
      }
    }
  }
  return files;
}

export function loadMdLessons(): EducationLesson[] {
  const files = readDirMd(
    path.join(ROOT, 'egitim'),
    path.join(process.cwd(), 'src', 'content', 'academy')
  );
  const lessons = files.map((file) => {
    const raw = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(raw);
    const slug = String(
      data.slug ?? path.basename(file).replace(/\.mdx?$/, '')
    );
    return {
      category: String(data.category),
      categoryTitle: String(data.categoryTitle ?? data.categoryTitle),
      slug,
      title: String(data.title),
      description: String(data.description),
      keywords: asStringArray(data.keywords),
      level: String(data.level ?? 'orta') as ContentLevel,
      publishedAt: String(data.publishedAt ?? data.date),
      updatedAt: String(data.updatedAt ?? data.publishedAt ?? data.date),
      readingMinutes: Number(data.readingMinutes ?? data.readTime ?? 6),
      sections: markdownToSections(content),
      faqs: asFaqs(data.faqs),
      toolCta: asToolCta(data.toolCta),
    };
  });
  const bySlug = new Map(lessons.map((l) => [l.slug, l]));
  return [...bySlug.values()];
}

export function loadMdBlogPosts(): BlogPost[] {
  const files = readDirMd(
    path.join(ROOT, 'blog'),
    path.join(process.cwd(), 'src', 'content', 'blog')
  );
  const posts = files.map((file) => {
    const raw = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(raw);
    const slug = String(
      data.slug ?? path.basename(file).replace(/\.mdx?$/, '')
    );
    return {
      slug,
      title: String(data.title),
      description: String(data.description),
      keywords: asStringArray(data.keywords),
      publishedAt: String(data.publishedAt ?? data.date),
      updatedAt: String(data.updatedAt ?? data.publishedAt ?? data.date),
      readingMinutes: Number(data.readingMinutes ?? data.readTime ?? 5),
      tags: asStringArray(data.tags),
      sections: markdownToSections(content),
      faqs: asFaqs(data.faqs),
      toolCta: asToolCta(data.toolCta),
    };
  });
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  return [...bySlug.values()];
}
