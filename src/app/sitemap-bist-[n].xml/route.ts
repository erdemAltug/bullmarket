import {
  buildBistSitemapChunks,
  sitemapEntriesToXml,
} from '@/lib/seo/sitemaps';

export const dynamic = 'force-static';
export const revalidate = 3600;

type Props = { params: Promise<{ n: string }> };

export async function generateStaticParams() {
  return buildBistSitemapChunks().map((_, i) => ({ n: String(i + 1) }));
}

export async function GET(_req: Request, { params }: Props) {
  const n = Number((await params).n);
  const chunks = buildBistSitemapChunks();
  const idx = n - 1;
  if (!Number.isFinite(n) || idx < 0 || idx >= chunks.length) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(sitemapEntriesToXml(chunks[idx]), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
