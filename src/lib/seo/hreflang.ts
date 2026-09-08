import type { Metadata } from 'next';
import { absoluteCanonical } from '@/lib/seo/canonical';
import { SITE_URL } from '@/lib/seo/symbols';

export type SeoLang = 'tr' | 'en';

export function resolveSeoLang(
  raw: string | string[] | undefined | null
): SeoLang {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v?.toLowerCase() === 'en' ? 'en' : 'tr';
}

/**
 * Hreflang targets clean absolute URLs (no ?lang=) so alternates
 * match the page canonical and avoid GSC duplicate/canonical conflicts.
 */
export function hreflangLanguages(path = ''): Record<string, string> {
  const base = absoluteCanonical(path || '/', { upperSymbol: true });
  return {
    'tr-TR': base,
    'en-US': base,
    'x-default': base,
  };
}

export function localePath(lang: SeoLang): string {
  return lang === 'en' ? `${SITE_URL}/en` : `${SITE_URL}/tr`;
}

export function rootHreflangLanguages(): Record<string, string> {
  return {
    'tr-TR': `${SITE_URL}/tr`,
    'en-US': `${SITE_URL}/en`,
    'x-default': SITE_URL,
  };
}

export function sitemapLanguageAlternates(path = ''): {
  languages: Record<string, string>;
} {
  return { languages: hreflangLanguages(path) };
}

export function withLangAlternates(
  path: string,
  canonical = true
): NonNullable<Metadata['alternates']> {
  const url = absoluteCanonical(path, { upperSymbol: true });
  return {
    ...(canonical ? { canonical: url } : {}),
    languages: hreflangLanguages(path),
  };
}
