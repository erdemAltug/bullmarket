import { SITE_URL } from '@/lib/seo/symbols';

const SYMBOL_ROUTE_ROOTS = /^(bist|kripto|nasdaq|crypto|us|fon|fx)$/i;

/** Real (lowercase) pages that live next to the [symbol] routes. */
const STATIC_HUB_SLUGS = new Set([
  'heatmap',
  'f-k-en-dusuk-hisseler',
  'yuksek-temettu-verenler-2026',
  'halka-arz-takvimi',
  'yapay-zeka-hisseleri',
  'balina-hareketleri-ve-trendler',
]);

/**
 * Absolute canonical: https, no www, no trailing slash (except root),
 * no query/hash. Path segments uppercased for ticker routes when asked.
 */
export function absoluteCanonical(
  pathOrUrl: string,
  opts?: { upperSymbol?: boolean }
): string {
  const raw = pathOrUrl.trim();
  let url: URL;
  try {
    url = raw.startsWith('http')
      ? new URL(raw)
      : new URL(raw.startsWith('/') ? raw : `/${raw}`, SITE_URL);
  } catch {
    return SITE_URL;
  }

  url.protocol = 'https:';
  url.hostname = url.hostname.replace(/^www\./i, '');
  url.search = '';
  url.hash = '';

  let pathname = url.pathname.replace(/\/{2,}/g, '/');
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  if (opts?.upperSymbol) {
    pathname = pathname
      .split('/')
      .map((seg, i, arr) => {
        // Only the ticker segment (/bist/THYAO, /kripto/BTCUSDT, /nasdaq/AAPL)
        // is uppercased. Intent slugs (/temettu, /bilanco, /hedef-fiyat) and
        // static hub pages (/bist/halka-arz-takvimi) keep their real casing,
        // otherwise the canonical points at a URL that 404s.
        if (
          i === 2 &&
          arr[1] &&
          SYMBOL_ROUTE_ROOTS.test(arr[1]) &&
          !STATIC_HUB_SLUGS.has(seg.toLowerCase())
        ) {
          return seg.toUpperCase();
        }
        return seg;
      })
      .join('/');
  }

  return `${SITE_URL}${pathname === '/' ? '' : pathname}`;
}

export function canonicalPath(path: string): string {
  const abs = absoluteCanonical(path, { upperSymbol: true });
  return abs.replace(SITE_URL, '') || '/';
}
