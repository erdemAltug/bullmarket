export type ContentLevel = 'baslangic' | 'orta' | 'ileri';

export interface ContentSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ToolCta {
  href: string;
  label: string;
  blurb: string;
}

export interface ContentFaq {
  question: string;
  answer: string;
}

export interface EducationLesson {
  category: string;
  categoryTitle: string;
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  level: ContentLevel;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  sections: ContentSection[];
  faqs: ContentFaq[];
  toolCta: ToolCta;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  tags: string[];
  sections: ContentSection[];
  faqs: ContentFaq[];
  toolCta: ToolCta;
}

export const EDUCATION_CATEGORIES = [
  {
    slug: 'borsa-temelleri',
    title: 'Borsa & Hisse Temelleri',
    description:
      'Yeni başlayanlar için borsa, temettü ve temel değerleme kavramları.',
  },
  {
    slug: 'teknik-analiz',
    title: 'Teknik Analiz & AI Sinyalleri',
    description:
      'RSI, Golden Cross, destek-direnç ve canlı sinyal okuma rehberleri.',
  },
  {
    slug: 'kripto-risk',
    title: 'Kripto & Risk Yönetimi',
    description:
      'Stop-loss, pozisyon boyutu ve smart money takip stratejileri.',
  },
] as const;
