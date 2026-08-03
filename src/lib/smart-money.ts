import type { ScannerItem } from '@/types/scanner';

export interface InstitutionalFlowRow {
  symbol: string;
  displaySymbol: string;
  name: string;
  changePercent: number;
  volume: string;
  volumeRaw: number;
  /** 0–100 hacim × momentum skoru (takas proxy) */
  interestScore: number;
  /** Göreli kurumsal ilgi etiketi */
  bias: 'accumulation' | 'distribution' | 'neutral';
  narrative: string;
}

export interface CryptoWhaleEvent {
  id: string;
  symbol: string;
  display: string;
  notionalUsd: number;
  side: 'buy' | 'sell';
  badge: 'whale_buy' | 'exchange_inflow';
  labelTr: string;
  at: number;
  source: 'aggTrades' | 'volume_proxy';
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** BİST kurumsal ilgi proxy — canlı hacim × |değişim|; resmi takas oranı değildir. */
export function rankInstitutionalFlows(
  items: ScannerItem[],
  limit = 12
): InstitutionalFlowRow[] {
  const bist = items.filter(
    (i) => i.category === 'BIST' && !i.displaySymbol.includes('XU')
  );
  if (!bist.length) return [];

  const maxVol = Math.max(...bist.map((i) => i.volumeRaw), 1);

  return bist
    .map((i) => {
      const volNorm = i.volumeRaw / maxVol;
      const mom = Math.abs(i.changePercent);
      const interestScore = Math.round(
        clamp(volNorm * 55 + Math.min(mom, 8) * 5.5, 0, 100)
      );
      const bias: InstitutionalFlowRow['bias'] =
        i.changePercent >= 1.2 && volNorm >= 0.35
          ? 'accumulation'
          : i.changePercent <= -1.2 && volNorm >= 0.35
            ? 'distribution'
            : 'neutral';

      const narrative =
        bias === 'accumulation'
          ? `${i.displaySymbol} — son seans güçlü alım baskısı (hacim ${i.volume}, ilgi ${interestScore}/100)`
          : bias === 'distribution'
            ? `${i.displaySymbol} — yüksek hacimli satış baskısı (hacim ${i.volume})`
            : `${i.displaySymbol} — dikkat çeken hacim × hareket (kurumsal ilgi proxy)`;

      return {
        symbol: i.symbol,
        displaySymbol: i.displaySymbol,
        name: i.name,
        changePercent: i.changePercent,
        volume: i.volume,
        volumeRaw: i.volumeRaw,
        interestScore,
        bias,
        narrative,
      };
    })
    .sort((a, b) => b.interestScore - a.interestScore)
    .slice(0, limit);
}

export function volumeProxyWhaleEvents(
  items: ScannerItem[]
): CryptoWhaleEvent[] {
  const targets = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
  const now = Date.now();
  return items
    .filter((i) => i.category === 'CRYPTO' && targets.includes(i.symbol))
    .map((i, idx) => {
      const notional = i.volumeRaw; // quote volume when available from market
      const buy = i.changePercent >= 0;
      return {
        id: `proxy-${i.symbol}-${idx}`,
        symbol: i.symbol,
        display: i.displaySymbol.replace('USDT', ''),
        notionalUsd: notional,
        side: buy ? ('buy' as const) : ('sell' as const),
        badge: buy ? ('whale_buy' as const) : ('exchange_inflow' as const),
        labelTr: buy ? 'BALİNA ALIMI (hacim proxy)' : 'BORSAYA GİRİŞ (hacim proxy)',
        at: now - idx * 60_000,
        source: 'volume_proxy' as const,
      };
    })
    .filter((e) => e.notionalUsd >= 1_000_000)
    .sort((a, b) => b.notionalUsd - a.notionalUsd);
}
