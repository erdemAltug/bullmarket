import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const YEAR = 60 * 60 * 24 * 365;

export function middleware(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang')?.toLowerCase();
  if (lang !== 'tr' && lang !== 'en') return NextResponse.next();

  const res = NextResponse.next();
  res.cookies.set('bullsye_lang', lang, {
    path: '/',
    maxAge: YEAR,
    sameSite: 'lax',
  });
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|html)$).*)',
  ],
};
