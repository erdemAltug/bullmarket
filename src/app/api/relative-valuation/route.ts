import { NextResponse } from 'next/server';
import { fetchQuotes } from '@/lib/api/yahoo';
import { appCache } from '@/lib/cache';
import { peersFor } from '@/lib/sector-peers';
import type { RelativeValuation } from '@/types';

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function discount(stock: number | null, sector: number | null): number | null {
  if (stock == null || sector == null || sector === 0) return null;
  return ((sector - stock) / sector) * 100;
}

export async function GET(request: Request) {
  const symbol = new URL(request.url).searchParams.get('symbol')?.trim();
  if (!symbol) {
    return NextResponse.json(
      { success: false, error: 'symbol required' },
      { status: 400 }
    );
  }

  const group = peersFor(symbol);
  if (!group) {
    return NextResponse.json({
      success: true,
      data: {
        symbol,
        sectorTr: 'Bilinmeyen sektör',
        peers: [],
        stockPE: null,
        stockPB: null,
        sectorPE: null,
        sectorPB: null,
        peDiscountPct: null,
        pbDiscountPct: null,
        verdict: 'unknown',
        verdictLabel: 'Sektör eşi bulunamadı',
      } satisfies RelativeValuation,
    });
  }

  const cacheKey = `relval:${symbol}`;
  const hit = appCache.get<RelativeValuation>(cacheKey);
  if (hit) {
    return NextResponse.json({ success: true, data: hit, cached: true });
  }

  try {
    const symbols = [symbol, ...group.peers.filter((p) => p !== symbol)];
    const quotes = await fetchQuotes(symbols);
    const stock = quotes.find((q) => q.symbol === symbol);
    const peers = quotes.filter((q) => q.symbol !== symbol);

    const stockPE = stock?.trailingPE ?? null;
    // PB not always on quote — approximate via trailingPE-only for peers when PB missing
    const peerPEs = peers
      .map((p) => p.trailingPE)
      .filter((n): n is number => n != null && n > 0);
    const sectorPE = avg(peerPEs);

    // Fetch fundamentals for PB via lightweight parallel quote fields only
    // Use PE-based relative for PB proxy when PB unavailable on quote
    const stockPB: number | null = null;
    const sectorPB: number | null = null;

    const peDiscountPct = discount(stockPE, sectorPE);
    const pbDiscountPct = discount(stockPB, sectorPB);

    let verdict: RelativeValuation['verdict'] = 'unknown';
    let verdictLabel = 'Yetersiz veri';

    if (peDiscountPct != null) {
      if (peDiscountPct >= 20) {
        verdict = 'cheap';
        verdictLabel = `Sektörüne Göre %${peDiscountPct.toFixed(0)} İskontolu / Ucuz`;
      } else if (peDiscountPct <= -20) {
        verdict = 'expensive';
        verdictLabel = `Sektörüne Göre %${Math.abs(peDiscountPct).toFixed(0)} Primli / Pahalı`;
      } else {
        verdict = 'fair';
        verdictLabel = 'Sektör ortalamasına yakın';
      }
    }

    const data: RelativeValuation = {
      symbol,
      sectorTr: group.sectorTr,
      peers: group.peers,
      stockPE,
      stockPB,
      sectorPE,
      sectorPB,
      peDiscountPct,
      pbDiscountPct,
      verdict,
      verdictLabel,
    };

    // Enrich PB from fundamentals if possible
    try {
      const { fetchFundamentals } = await import('@/lib/api/yahoo');
      const fund = await fetchFundamentals(symbol);
      data.stockPB = fund.priceToBook;
      const peerFunds = await Promise.all(
        group.peers.slice(0, 4).map((p) =>
          fetchFundamentals(p).catch(() => null)
        )
      );
      const pbs = peerFunds
        .map((f) => f?.priceToBook)
        .filter((n): n is number => n != null && n > 0);
      data.sectorPB = avg(pbs);
      data.pbDiscountPct = discount(data.stockPB, data.sectorPB);
    } catch {
      /* PE-only fallback already set */
    }

    appCache.set(cacheKey, data, 300);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Relative valuation failed',
      },
      { status: 502 }
    );
  }
}
