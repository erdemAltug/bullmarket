/**
 * Shared CDN cache policy for public market endpoints.
 *
 * `s-maxage` lets Vercel's edge (or any CDN) answer repeat requests without
 * invoking the function; `stale-while-revalidate` keeps answering instantly
 * while one background request refreshes. Browsers revalidate quickly.
 */
export function cacheHeaders(freshSec: number, staleSec = freshSec * 10): HeadersInit {
  const browser = Math.min(freshSec, 30);
  return {
    'Cache-Control': `public, max-age=${browser}, s-maxage=${freshSec}, stale-while-revalidate=${staleSec}`,
    'CDN-Cache-Control': `public, s-maxage=${freshSec}, stale-while-revalidate=${staleSec}`,
  };
}
