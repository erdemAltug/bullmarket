/** Programmatic SEO matrix: 1 asset → intent pages */
export const BIST_MATRIX_SLUGS = [
  '',
  'hedef-fiyat',
  'temettu',
  'bilanco',
] as const;

export type BistMatrixSlug = (typeof BIST_MATRIX_SLUGS)[number];

export const ISR_POPULAR_REVALIDATE = 300;
/** Long-tail on-demand pages — stale-while-revalidate ~24h */
export const ISR_LONGTAIL_REVALIDATE = 86_400;
/** Build-time static params: top N only; rest via dynamicParams */
export const ISR_STATIC_TOP_N = 100;

export function bistMatrixPath(symbol: string, slug: BistMatrixSlug = '') {
  const s = symbol.toUpperCase().replace(/\.IS$/i, '');
  return slug ? `/bist/${s}/${slug}` : `/bist/${s}`;
}

export const BIST_MATRIX_NAV: {
  slug: BistMatrixSlug;
  label: string;
  intent: string;
}[] = [
  { slug: '', label: 'Karne & Skor', intent: 'analiz / yorum' },
  { slug: 'hedef-fiyat', label: 'Hedef Fiyat', intent: 'hedef fiyat' },
  { slug: 'temettu', label: 'Temettü', intent: 'temettü verimi' },
  { slug: 'bilanco', label: 'Bilanço', intent: 'F/K & rasyo' },
];

/** Chunk sitemap entries for Google 50k URL soft limit / crawl budget */
export const SITEMAP_CHUNK_SIZE = 1_000;
