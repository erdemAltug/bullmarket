import {
  buildBistSitemapChunks,
  sitemapEntriesToXml,
} from '@/lib/seo/sitemaps';

export const dynamic = 'force-static';
export const revalidate = 3600;

const SHARD = 0;

export async function GET() {
  const chunk = buildBistSitemapChunks()[SHARD];
  if (!chunk) return new Response('Not found', { status: 404 });
  return new Response(sitemapEntriesToXml(chunk), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
