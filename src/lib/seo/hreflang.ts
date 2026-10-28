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
 * Inner pages serve one URL whose language comes from a cookie, so there is
 * no separate URL per language yet. Pointing tr/en/x-default at the same URL
 * tells Google nothing, so only x-default is emitted until real /en/... URLs
 * exist. Root /tr and /en use rootHreflangLanguages() instead.
 */
export function hreflangLanguages(path = ''): Record<string, string> {
  const base = absoluteCanonical(path || '/', { upperSymbol: true });
  return { 'x-default': base };
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
  return canonical ? { canonical: url } : {};
}
