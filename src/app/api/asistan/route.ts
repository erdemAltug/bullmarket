import { NextResponse } from 'next/server';
import {
  getCurrentSessionUser,
  isAnonymousUserId,
} from '@/lib/auth-user';
import { buildAsistanContextPack } from '@/lib/asistan/build-context';
import { callAsistanLlm, type ChatTurn } from '@/lib/asistan/groq';
import { appCache } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DAILY_LIMIT = 20;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function rateCheck(userId: string): { ok: boolean; remaining: number; used: number } {
  const key = `asistan:rate:${userId}:${todayKey()}`;
  const used = appCache.get<number>(key) ?? 0;
  if (used >= DAILY_LIMIT) {
    return { ok: false, remaining: 0, used };
  }
  const next = used + 1;
  appCache.set(key, next, 86_400);
  return { ok: true, remaining: DAILY_LIMIT - next, used: next };
}

type Body = {
  message?: string;
  history?: ChatTurn[];
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentSessionUser();
    if (!user?.id || isAnonymousUserId(user.id)) {
      return NextResponse.json(
        { success: false, error: 'Asistan yalnızca kayıtlı kullanıcılar içindir.' },
        { status: 401 }
      );
    }

    if (!process.env.GROQ_API_KEY?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Asistan şu an kapalı. Biraz sonra tekrar dene.',
        },
        { status: 503 }
      );
    }

    const body = (await req.json()) as Body;
    const message = String(body.message ?? '').trim();
    if (message.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Mesaj çok kısa.' },
        { status: 400 }
      );
    }
    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Mesaj çok uzun (max 2000).' },
        { status: 400 }
      );
    }

    const rate = rateCheck(user.id);
    if (!rate.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Günlük mesaj limitine ulaştınız (${DAILY_LIMIT}). Yarın tekrar deneyin.`,
        },
        { status: 429 }
      );
    }

    const history = Array.isArray(body.history)
      ? body.history
          .filter(
            (t) =>
              t &&
              (t.role === 'user' || t.role === 'assistant') &&
              typeof t.content === 'string'
          )
          .slice(-6)
      : [];

    const pack = await buildAsistanContextPack({
      userId: user.id,
      email: user.email,
      name: 'name' in user ? String((user as { name?: string }).name ?? '') : null,
      message,
      historyText: history
        .filter((t) => t.role === 'user')
        .map((t) => t.content)
        .join('\n'),
    });

    const reply = await callAsistanLlm({
      contextPack: pack.systemExtra,
      history,
      message,
    });

    return NextResponse.json({
      success: true,
      data: {
        reply,
        remaining: rate.remaining,
        positionCount: pack.positionCount,
      },
    });
  } catch (e) {
    console.error('asistan:', e);
    const raw = e instanceof Error ? e.message : '';
    const safe =
      raw.includes('Asistan') || raw.includes('limit') || raw.includes('kapalı')
        ? raw
        : 'Asistan yanıt veremedi. Biraz sonra tekrar dene.';
    return NextResponse.json(
      { success: false, error: safe },
      { status: 502 }
    );
  }
}
