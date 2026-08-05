import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';

export type SeoLang = 'tr' | 'en';

export function resolveSeoLang(
  raw: string | string[] | undefined | null
): SeoLang {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v?.toLowerCase() === 'en' ? 'en' : 'tr';
}

/** Path without query, e.g. `/bist/THYAO` or `` for home */
export function hreflangLanguages(path = ''): Record<string, string> {
  const base = path ? `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}` : SITE_URL;
  const joiner = base.includes('?') ? '&' : '?';
  return {
    'tr-TR': `${base}${joiner}lang=tr`,
    'en-US': `${base}${joiner}lang=en`,
    'x-default': `${base}${joiner}lang=tr`,
  };
}

export function localePath(lang: SeoLang): string {
  return lang === 'en' ? `${SITE_URL}/en` : `${SITE_URL}/tr`;
}

export function rootHreflangLanguages(): Record<string, string> {
  return {
    'tr-TR': `${SITE_URL}/tr`,
    'en-US': `${SITE_URL}/en`,
    'x-default': `${SITE_URL}/tr`,
  };
}

export function sitemapLanguageAlternates(path = ''): {
  languages: Record<string, string>;
} {
  const base = path ? `${SITE_URL}${path}` : SITE_URL;
  const joiner = '?';
  return {
    languages: {
      'tr-TR': `${base}${joiner}lang=tr`,
      'en-US': `${base}${joiner}lang=en`,
      'x-default': `${base}${joiner}lang=tr`,
    },
  };
}

export function withLangAlternates(
  path: string,
  canonical = true
): NonNullable<Metadata['alternates']> {
  const url = `${SITE_URL}${path}`;
  return {
    ...(canonical ? { canonical: url } : {}),
    languages: hreflangLanguages(path),
  };
}
