import { NextResponse } from 'next/server';
import {
  applyVote,
  getSentimentBucket,
  toSentiment,
  type SentimentVote,
} from '@/lib/community-sentiment';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol')?.trim();
    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'symbol gerekli' },
        { status: 400 }
      );
    }
    const changePercent = Number(searchParams.get('change') ?? 0) || 0;
    const bucket = getSentimentBucket(symbol, changePercent);
    return NextResponse.json({
      success: true,
      data: toSentiment(symbol, bucket),
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Sentiment hatası',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      symbol?: string;
      vote?: SentimentVote;
      previous?: SentimentVote | null;
      changePercent?: number;
    };
    const symbol = body.symbol?.trim();
    const vote = body.vote;
    if (!symbol || (vote !== 'bull' && vote !== 'bear')) {
      return NextResponse.json(
        { success: false, error: 'symbol ve vote gerekli' },
        { status: 400 }
      );
    }
    const bucket = applyVote(
      symbol,
      vote,
      body.previous ?? null,
      body.changePercent ?? 0
    );
    return NextResponse.json({
      success: true,
      data: toSentiment(symbol, bucket, vote),
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Oy kaydı başarısız',
      },
      { status: 500 }
    );
  }
}
