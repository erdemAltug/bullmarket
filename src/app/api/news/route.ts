import { NextResponse } from 'next/server';
import axios from 'axios';
import { appCache } from '@/lib/cache';
import type { NewsItem } from '@/types';

const FEEDS: { category: NewsItem['category']; url: string }[] = [
  {
    category: 'bist',
    url: 'https://news.google.com/rss/search?q=Borsa+%C4%B0stanbul+OR+B%C4%B0ST+hisse&hl=tr&gl=TR&ceid=TR:tr',
  },
  {
    category: 'crypto',
    url: 'https://news.google.com/rss/search?q=Bitcoin+OR+kripto+borsa&hl=tr&gl=TR&ceid=TR:tr',
  },
  {
    category: 'macro',
    url: 'https://news.google.com/rss/search?q=TCMB+OR+enflasyon+OR+faiz+karar%C4%B1&hl=tr&gl=TR&ceid=TR:tr',
  },
];

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

function parseItems(xml: string, category: NewsItem['category']): NewsItem[] {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  return blocks.slice(0, 8).map((block, i) => {
    const title = tag(block, 'title');
    const link = tag(block, 'link');
    const pub = tag(block, 'pubDate');
    const source = tag(block, 'source') || undefined;
    return {
      id: `${category}-${i}-${Buffer.from(title).toString('base64url').slice(0, 16)}`,
      title,
      link,
      publishedAt: pub ? new Date(pub).toISOString() : new Date().toISOString(),
      category,
      source,
    };
  });
}

export async function GET() {
  const cacheKey = 'news:feed:v1';
  const hit = appCache.get<NewsItem[]>(cacheKey);
  if (hit) {
    return NextResponse.json({ success: true, data: { items: hit }, cached: true });
  }

  try {
    const batches = await Promise.all(
      FEEDS.map(async (feed) => {
        const { data: xml } = await axios.get<string>(feed.url, {
          responseType: 'text',
          timeout: 12_000,
          headers: {
            'User-Agent': 'Bullsye/1.0 (news aggregator)',
            Accept: 'application/rss+xml, application/xml, text/xml, */*',
          },
        });
        return parseItems(xml, feed.category);
      })
    );

    const items = batches
      .flat()
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
      .slice(0, 24);

    appCache.set(cacheKey, items, 120);
    return NextResponse.json({ success: true, data: { items } });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'News fetch failed',
      },
      { status: 502 }
    );
  }
}
