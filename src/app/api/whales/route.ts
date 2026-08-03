import { NextResponse } from 'next/server';
import { fetchLargeCryptoTrades } from '@/lib/api/binance';
import type { CryptoWhaleEvent } from '@/lib/smart-money';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const trades = await fetchLargeCryptoTrades(
      ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
      250_000
    );

    const events: CryptoWhaleEvent[] = trades.slice(0, 24).map((t) => {
      const buy = !t.isBuyerMaker; // taker buy
      const display = t.symbol.replace('USDT', '');
      return {
        id: `${t.symbol}-${t.id}`,
        symbol: t.symbol,
        display,
        notionalUsd: t.quoteQty,
        side: buy ? 'buy' : 'sell',
        badge: buy ? 'whale_buy' : 'exchange_inflow',
        labelTr: buy ? 'BALİNA ALIMI' : 'BORSAYA GİRİŞ',
        at: t.time,
        source: 'aggTrades',
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        events,
        minNotionalUsd: 250_000,
        note: 'Canlı borsa aggTrades — $250k+ notional. Resmi zincir balina cüzdanı değildir.',
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Whale feed hatası',
        data: { events: [] as CryptoWhaleEvent[] },
      },
      { status: 500 }
    );
  }
}
