import axios from 'axios';
import { appCache } from '@/lib/cache';
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

const TICKER_RE =
  /\b(THYAO|GARAN|ASELS|AKBNK|YKBNK|EREGL|BIMAS|SISE|TUPRS|TCELL|PGSUS|FROTO|SAHOL|KCHOL|ISCTR|HALKB|VAKBN|SASA|ASTOR|BTC|ETH|XU100)\b/i;

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
    const tickerMatch = title.match(TICKER_RE);
    return {
      id: `${category}-${i}-${Buffer.from(title).toString('base64url').slice(0, 16)}`,
      title,
      link,
      publishedAt: pub ? new Date(pub).toISOString() : new Date().toISOString(),
      category,
      source,
      ticker: tickerMatch ? tickerMatch[1].toUpperCase() : undefined,
    };
  });
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
