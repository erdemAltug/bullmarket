import { peersFor } from '@/lib/sector-peers';
import {
  normalizeYieldPct,
  resolveSymbol,
  type AssetMarket,
} from '@/lib/symbol-resolve';
import type { HealthFinding, PortfolioHealthReport } from '@/types';

export interface AuditHolding {
  symbol: string;
  weight: number;
  /** Yahoo symbol if known from search (e.g. THYAO.IS, AAPL, BTC-USD) */
  yahoo?: string | null;
  market?: AssetMarket;
  name?: string;
}

export interface LiveHoldingMetrics {
  symbol: string;
  display: string;
  yahoo: string | null;
  market: AssetMarket;
  name: string;
  price: number | null;
  currency: string | null;
  beta: number | null;
  dividendYieldPct: number | null;
  sector: string;
  pe: number | null;
  marketCap: number | null;
  ok: boolean;
  error?: string;
}

export interface PortfolioAuditResult extends PortfolioHealthReport {
  diversification: number;
  risk: number;
  estimatedYieldPct: number;
  betaIndex: number;
  sectorWeights: { sector: string; weight: number }[];
  holdings: LiveHoldingMetrics[];
  live: boolean;
}

export function fallbackSector(
  display: string,
  yahoo: string | null,
  market: AssetMarket
): string {
  if (market === 'crypto') return 'Kripto';
  if (market === 'us') return 'NASDAQ / US';
  const peers = peersFor(yahoo ?? `${display}.IS`);
  return peers?.sectorTr ?? 'BİST';
}

export function auditPortfolioWeights(
  holdings: AuditHolding[],
  liveMetrics?: LiveHoldingMetrics[] | null
): PortfolioAuditResult | null {
  if (!holdings.length) return null;

  const total = holdings.reduce((s, h) => s + h.weight, 0) || 1;
  const normalized = holdings.map((h) => ({
    ...h,
    weight: (h.weight / total) * 100,
  }));

  const metricsByDisplay = new Map(
    (liveMetrics ?? []).map((m) => [m.display.toUpperCase(), m])
  );

  const enriched = normalized.map((h) => {
    const key = h.symbol.toUpperCase();
    const live = metricsByDisplay.get(key);
    const resolved = resolveSymbol(h.yahoo ?? h.symbol);
    const market = h.market ?? live?.market ?? resolved.market;
    const yahoo = h.yahoo ?? live?.yahoo ?? resolved.yahoo;
    const sector =
      live?.sector ||
      fallbackSector(h.symbol, yahoo, market);
    return {
      ...h,
      market,
      yahoo,
      sector,
      beta: live?.beta ?? (market === 'crypto' ? 1.65 : 1),
      yieldPct: live?.dividendYieldPct ?? 0,
      name: live?.name ?? h.name ?? h.symbol,
      liveOk: live?.ok ?? false,
    };
  });

  const herfindahl = enriched.reduce((s, h) => {
    const w = h.weight / 100;
    return s + w * w;
  }, 0);
  const diversification = Math.round((1 - herfindahl) * 100);

  const sectorMap = new Map<string, number>();
  for (const h of enriched) {
    sectorMap.set(h.sector, (sectorMap.get(h.sector) ?? 0) + h.weight);
  }
  const sectorWeights = [...sectorMap.entries()]
    .map(([sector, weight]) => ({ sector, weight }))
    .sort((a, b) => b.weight - a.weight);

  const cryptoShare = enriched
    .filter((h) => h.market === 'crypto')
    .reduce((s, h) => s + h.weight, 0);
  const usShare = enriched
    .filter((h) => h.market === 'us')
    .reduce((s, h) => s + h.weight, 0);
  const bistShare = enriched
    .filter((h) => h.market === 'bist')
    .reduce((s, h) => s + h.weight, 0);

  const estimatedYieldPct =
    Math.round(
      enriched.reduce((s, h) => s + (h.yieldPct * h.weight) / 100, 0) * 100
    ) / 100;

  let betaIndex = enriched.reduce(
    (s, h) => s + ((h.beta ?? 1) * h.weight) / 100,
    0
  );
  betaIndex = Math.round(betaIndex * 100) / 100;

  const risk = Math.min(
    100,
    Math.round(
      28 +
        cryptoShare * 0.48 +
        herfindahl * 38 +
        Math.max(0, betaIndex - 1) * 28 +
        (usShare > 0 && bistShare > 0 ? -4 : 0)
    )
  );

  const findings: HealthFinding[] = [];
  const live = Boolean(liveMetrics?.length);

  const topSector = sectorWeights[0];
  if (topSector && topSector.weight >= 40) {
    findings.push({
      id: 'sector-heavy',
      severity: topSector.weight >= 60 ? 'critical' : 'warn',
      title: 'Sektörel Yoğunlaşma',
      message: `Portföyünüzün %${topSector.weight.toFixed(0)}'i ${topSector.sector} — çeşitlendirin.`,
    });
  }

  const maxHolding = [...enriched].sort((a, b) => b.weight - a.weight)[0];
  if (maxHolding && maxHolding.weight >= 40) {
    findings.push({
      id: 'single-heavy',
      severity: maxHolding.weight >= 55 ? 'critical' : 'warn',
      title: 'Tek Varlık Riski',
      message: `${maxHolding.symbol} portföyün %${maxHolding.weight.toFixed(0)}'ini oluşturuyor.`,
    });
  }

  if (bistShare >= 80) {
    findings.push({
      id: 'bist-heavy',
      severity: 'warn',
      title: 'BİST Yoğunluğu',
      message: `Portföyünüz %${bistShare.toFixed(0)} BİST. NASDAQ / kripto ile coğrafi çeşitlilik düşünün.`,
    });
  }

  if (usShare >= 80) {
    findings.push({
      id: 'us-heavy',
      severity: 'info',
      title: 'USD Yoğunluğu',
      message: `Portföyünüz %${usShare.toFixed(0)} ABD hissesi — kur ve Fed riskini izleyin.`,
    });
  }

  if (cryptoShare >= 40) {
    findings.push({
      id: 'crypto-heavy',
      severity: cryptoShare >= 60 ? 'critical' : 'warn',
      title: 'Kripto Ağırlığı',
      message: `Kripto payı %${cryptoShare.toFixed(0)}.`,
    });
  }

  if (live && estimatedYieldPct > 0) {
    findings.push({
      id: 'yield-live',
      severity: 'info',
      title: 'Canlı Temettü',
      message: `Ağırlıklı yıllık temettü verimi ~%${estimatedYieldPct.toFixed(2)}.`,
    });
  } else if (live) {
    findings.push({
      id: 'yield-low',
      severity: 'info',
      title: 'Temettü',
      message:
        'Seçili varlıkların temettü verimi düşük veya sıfır (büyüme / kripto odaklı).',
    });
  }

  if (betaIndex >= 1.35) {
    findings.push({
      id: 'beta-high',
      severity: 'warn',
      title: 'Yüksek Beta',
      message: `Canlı portföy beta ~${betaIndex}.`,
    });
  }

  const failed = (liveMetrics ?? []).filter((m) => !m.ok);
  if (failed.length) {
    findings.push({
      id: 'fetch-fail',
      severity: 'warn',
      title: 'Eksik Veri',
      message: `${failed.map((f) => f.display).join(', ')} için canlı veri alınamadı.`,
    });
  }

  const health = Math.max(
    0,
    Math.min(100, Math.round(diversification * 0.55 + (100 - risk) * 0.45))
  );

  return {
    score: health,
    label:
      health >= 80 ? 'Dengeli' : health >= 60 ? 'Orta risk' : 'Yüksek risk',
    findings,
    diversification,
    risk,
    estimatedYieldPct,
    betaIndex,
    sectorWeights,
    holdings: liveMetrics ?? [],
    live,
  };
}

export { normalizeYieldPct, resolveSymbol };
