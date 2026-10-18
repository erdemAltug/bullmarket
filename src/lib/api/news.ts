import axios from 'axios';
import { appCache } from '@/lib/cache';
import {
  SEO_BIST_TICKERS,
  SEO_CRYPTO_SYMBOLS,
  SEO_US_TICKERS,
} from '@/lib/seo/symbols';
import type { NewsItem } from '@/types';

const FEEDS: {
  category: NewsItem['category'];
  url: string;
  label: string;
}[] = [
  {
    category: 'bist',
    label: 'KAP / BİST',
    url: 'https://news.google.com/rss/search?q=KAP+bildirim+OR+Borsa+%C4%B0stanbul+OR+B%C4%B0ST+hisse&hl=tr&gl=TR&ceid=TR:tr',
  },
  {
    category: 'crypto',
    label: 'Kripto',
    url: 'https://news.google.com/rss/search?q=Bitcoin+OR+kripto+borsa&hl=tr&gl=TR&ceid=TR:tr',
  },
  {
    category: 'macro',
    label: 'Makro',
    url: 'https://news.google.com/rss/search?q=TCMB+OR+enflasyon+OR+Fed+faiz+OR+CPI&hl=tr&gl=TR&ceid=TR:tr',
  },
];

const TICKER_SET = new Set<string>([
  ...SEO_BIST_TICKERS,
  ...SEO_US_TICKERS,
  ...SEO_CRYPTO_SYMBOLS.flatMap((symbol) => {
    const upper = symbol.toUpperCase();
    return [upper, upper.replace(/USDT$/, '')];
  }),
]);

const SYMBOL_NEWS_TTL_SEC = 45 * 60;
const SYMBOL_NEWS_FAIL_TTL_SEC = 5 * 60;
const HEADLINE_WINDOW_MS = 72 * 60 * 60 * 1000;
const symbolNewsInflight = new Map<string, Promise<NewsItem[]>>();

export type SymbolNewsKind = 'bist' | 'us' | 'crypto';

function detectTicker(title: string): string | undefined {
  const tokens = title.toLocaleUpperCase('en-US').match(/[A-Z0-9]{2,10}/g) ?? [];
  for (const token of tokens) {
    if (TICKER_SET.has(token)) return token;
  }
  return undefined;
}

function shortCompanyToken(name: string, symbol: string): string | null {
  const cleaned = name
    .replace(/\b(A\.?\s*S\.?|A\.?\s*Ş\.?|INC\.?|CORP\.?|LTD\.?|PLC|CO\.?)\b/gi, ' ')
    .replace(/[^0-9A-Za-zĞÜŞİÖÇğüşıöç\s]/g, ' ')
    .trim();
  const word = cleaned.split(/\s+/).find((part) => part.length >= 4);
  if (!word || word.toLocaleUpperCase('en-US') === symbol.toLocaleUpperCase('en-US')) {
    return null;
  }
  return word;
}

function symbolNewsQuery(symbol: string, name: string, kind: SymbolNewsKind): string {
  const token = shortCompanyToken(name, symbol);
  const extra = token ? ` OR ${token}` : '';
  if (kind === 'crypto') {
    const base = symbol.replace(/USDT$/i, '');
    return `${base} kripto${extra}`;
  }
  if (kind === 'us') return `${symbol} stock${extra}`;
  return `${symbol} hisse${extra}`;
}

function withinHeadlineWindow(iso: string): boolean {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return false;
  const age = Date.now() - at;
  return age >= -60 * 60 * 1000 && age <= HEADLINE_WINDOW_MS;
}

function decodeXml(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decodeXml(m[1].trim()) : '';
}

function parseItems(
  xml: string,
  category: NewsItem['category'],
  feedLabel: string
): NewsItem[] {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  return blocks.slice(0, 8).map((block, i) => {
    const title = tag(block, 'title');
    const link = tag(block, 'link');
    const pub = tag(block, 'pubDate');
    const source = tag(block, 'source') || feedLabel;
    return {
      id: `${category}-${i}-${Buffer.from(title).toString('base64url').slice(0, 16)}`,
      title,
      link,
      publishedAt: pub ? new Date(pub).toISOString() : new Date().toISOString(),
      category,
      source,
      ticker: detectTicker(title),
    };
  });
}

async function loadSymbolHeadlines(
  symbol: string,
  name: string,
  kind: SymbolNewsKind
): Promise<NewsItem[]> {
  const q = symbolNewsQuery(symbol, name, kind);
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=tr&gl=TR&ceid=TR:tr`;
  const { data: xml } = await axios.get<string>(url, {
    responseType: 'text',
    timeout: 12_000,
    headers: {
      'User-Agent': 'Bullsye/1.0 (news aggregator)',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
  });
  const category: NewsItem['category'] = kind === 'crypto' ? 'crypto' : 'bist';
  return parseItems(xml, category, 'Google News')
    .filter((item) => item.title && item.link && withinHeadlineWindow(item.publishedAt))
    .slice(0, 3);
}

/** Per-symbol headlines. Title, source and link only. Cached 45 minutes. */
export async function fetchSymbolHeadlines(input: {
  symbol: string;
  name: string;
  kind: SymbolNewsKind;
}): Promise<NewsItem[]> {
  const symbol = input.symbol.trim().toUpperCase();
  const key = `news:symbol:v1:${input.kind}:${symbol}`;
  const hit = appCache.get<NewsItem[]>(key);
  if (hit) return hit;

  const pending = symbolNewsInflight.get(key);
  if (pending) return pending;

  const job = loadSymbolHeadlines(symbol, input.name, input.kind)
    .then((items) => {
      appCache.set(key, items, SYMBOL_NEWS_TTL_SEC);
      return items;
    })
    .catch(() => {
      const empty: NewsItem[] = [];
      appCache.set(key, empty, SYMBOL_NEWS_FAIL_TTL_SEC);
      return empty;
    })
    .finally(() => {
      symbolNewsInflight.delete(key);
    });

  symbolNewsInflight.set(key, job);
  return job;
}

/** Google News RSS — KAP/BİST, crypto, macro (free, no API key). */
export async function fetchMarketNews(limit = 24): Promise<NewsItem[]> {
  const cacheKey = `news:feed:v2:${limit}`;
  const hit = appCache.get<NewsItem[]>(cacheKey);
  if (hit) return hit;

  const batches = await Promise.all(
    FEEDS.map(async (feed) => {
      try {
        const { data: xml } = await axios.get<string>(feed.url, {
          responseType: 'text',
          timeout: 12_000,
          headers: {
            'User-Agent': 'Bullsye/1.0 (news aggregator)',
            Accept: 'application/rss+xml, application/xml, text/xml, */*',
          },
        });
        return parseItems(xml, feed.category, feed.label);
      } catch {
        return [] as NewsItem[];
      }
    })
  );

  const items = batches
    .flat()
    .filter((i) => i.title && i.link)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, limit);

  appCache.set(cacheKey, items, 120);
  return items;
}

/** Faiz / kredi / TCMB / Fed — ayrı RSS, makro kategorisi. */
export async function fetchRatesNews(limit = 16): Promise<NewsItem[]> {
  const cacheKey = `news:rates:v1:${limit}`;
  const hit = appCache.get<NewsItem[]>(cacheKey);
  if (hit) return hit;

  const feeds = [
    {
      url: 'https://news.google.com/rss/search?q=TCMB+politika+faizi+OR+mevduat+faizi+OR+kredi+faizi&hl=tr&gl=TR&ceid=TR:tr',
      label: 'TR faiz',
    },
    {
      url: 'https://news.google.com/rss/search?q=Fed+interest+rate+OR+ECB+rate+OR+FOMC&hl=tr&gl=TR&ceid=TR:tr',
      label: 'Küresel faiz',
    },
  ];

  const batches = await Promise.all(
    feeds.map(async (feed) => {
      try {
        const { data: xml } = await axios.get<string>(feed.url, {
          responseType: 'text',
          timeout: 12_000,
          headers: {
            'User-Agent': 'Bullsye/1.0 (news aggregator)',
            Accept: 'application/rss+xml, application/xml, text/xml, */*',
          },
        });
        return parseItems(xml, 'macro', feed.label);
      } catch {
        return [] as NewsItem[];
      }
    })
  );

  const items = batches
    .flat()
    .filter((i) => i.title && i.link)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, limit);

  appCache.set(cacheKey, items, 120);
  return items;
}
