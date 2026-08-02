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
    href: String(o.href ?? '/'),
    label: String(o.label ?? 'Terminale git'),
    blurb: String(o.blurb ?? ''),
  };
}

function readDirMd(dir: string): string[] {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(abs, f));
}

export function loadMdLessons(): EducationLesson[] {
  return readDirMd('egitim').map((file) => {
    const raw = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(raw);
    const slug = String(data.slug ?? path.basename(file, '.md'));
    return {
      category: String(data.category),
      categoryTitle: String(data.categoryTitle),
      slug,
      title: String(data.title),
      description: String(data.description),
      keywords: asStringArray(data.keywords),
      level: String(data.level ?? 'orta') as ContentLevel,
      publishedAt: String(data.publishedAt),
      updatedAt: String(data.updatedAt ?? data.publishedAt),
      readingMinutes: Number(data.readingMinutes ?? 6),
      sections: markdownToSections(content),
      faqs: asFaqs(data.faqs),
      toolCta: asToolCta(data.toolCta),
    };
  });
}

export function loadMdBlogPosts(): BlogPost[] {
  return readDirMd('blog').map((file) => {
    const raw = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(raw);
    const slug = String(data.slug ?? path.basename(file, '.md'));
    return {
      slug,
      title: String(data.title),
      description: String(data.description),
      keywords: asStringArray(data.keywords),
      publishedAt: String(data.publishedAt),
      updatedAt: String(data.updatedAt ?? data.publishedAt),
      readingMinutes: Number(data.readingMinutes ?? 5),
      tags: asStringArray(data.tags),
      sections: markdownToSections(content),
      faqs: asFaqs(data.faqs),
      toolCta: asToolCta(data.toolCta),
    };
  });
}
