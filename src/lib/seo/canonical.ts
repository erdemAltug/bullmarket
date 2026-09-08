import { SITE_URL } from '@/lib/seo/symbols';

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
        // /bist/THYAO, /bist/THYAO/hedef-fiyat, /kripto/BTCUSDT, /nasdaq/AAPL
        if (i >= 2 && arr[1] && /^(bist|kripto|nasdaq|crypto|us|fon|fx)$/i.test(arr[1])) {
          if (seg === 'hedef-fiyat' || seg === 'heatmap') return seg;
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
