import { peersFor } from '@/lib/sector-peers';
import type { HealthFinding, PortfolioHealthReport } from '@/types';

export interface AuditHolding {
  symbol: string;
  weight: number;
}

export interface PortfolioAuditResult extends PortfolioHealthReport {
  diversification: number;
  risk: number;
  estimatedYieldPct: number;
  betaIndex: number;
  sectorWeights: { sector: string; weight: number }[];
}

function toYahoo(sym: string): string {
  const s = sym.trim().toUpperCase();
  if (s.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'BNB'].includes(s)) {
    return s.endsWith('USDT') ? s : `${s}USDT`;
  }
  if (s.includes('.')) return s;
  return `${s}.IS`;
}

function assetClass(sym: string): 'bist' | 'crypto' | 'fx' {
  const u = sym.toUpperCase();
  if (
    u.endsWith('USDT') ||
    ['BTC', 'ETH', 'SOL', 'BNB'].includes(u.replace('.IS', ''))
  ) {
    return 'crypto';
  }
  return 'bist';
}

function sectorOf(sym: string): string {
  const yahoo = toYahoo(sym);
  if (yahoo.endsWith('USDT') || assetClass(sym) === 'crypto') return 'Kripto';
  const peers = peersFor(yahoo);
  return peers?.sectorTr ?? 'Diğer BİST';
}

export function auditPortfolioWeights(
  holdings: AuditHolding[]
): PortfolioAuditResult | null {
  if (!holdings.length) return null;

  const total = holdings.reduce((s, h) => s + h.weight, 0) || 1;
  const normalized = holdings.map((h) => ({
    ...h,
    weight: (h.weight / total) * 100,
  }));

  const herfindahl = normalized.reduce((s, h) => {
    const w = h.weight / 100;
    return s + w * w;
  }, 0);
  const diversification = Math.round((1 - herfindahl) * 100);

  const sectorMap = new Map<string, number>();
  for (const h of normalized) {
    const sec = sectorOf(h.symbol);
    sectorMap.set(sec, (sectorMap.get(sec) ?? 0) + h.weight);
  }
  const sectorWeights = [...sectorMap.entries()]
    .map(([sector, weight]) => ({ sector, weight }))
    .sort((a, b) => b.weight - a.weight);

  const cryptoShare = normalized
    .filter((h) => assetClass(h.symbol) === 'crypto')
    .reduce((s, h) => s + h.weight, 0);
  const tryShare = 100 - cryptoShare;

  const estimatedYieldPct = 0;

  let betaIndex = 0;
  for (const h of normalized) {
    const sec = sectorOf(h.symbol);
    let b = 1;
    if (sec === 'Kripto') b = 1.65;
    else if (sec.includes('Banka')) b = 1.15;
    else if (sec.includes('Havacılık')) b = 1.35;
    else if (sec.includes('Savunma')) b = 1.25;
    betaIndex += (b * h.weight) / 100;
  }
  betaIndex = Math.round(betaIndex * 100) / 100;

  const risk = Math.min(
    100,
    Math.round(30 + cryptoShare * 0.45 + herfindahl * 40 + (betaIndex - 1) * 25)
  );

  const findings: HealthFinding[] = [];

  const topSector = sectorWeights[0];
  if (topSector && topSector.weight >= 40) {
    findings.push({
      id: 'sector-heavy',
      severity: topSector.weight >= 60 ? 'critical' : 'warn',
      title: 'Sektörel Yoğunlaşma',
      message: `Portföyünüzün %${topSector.weight.toFixed(0)}'i ${topSector.sector} sektöründe — aşırı riskli.`,
    });
  }

  const maxHolding = [...normalized].sort((a, b) => b.weight - a.weight)[0];
  if (maxHolding && maxHolding.weight >= 40) {
    findings.push({
      id: 'single-heavy',
      severity: maxHolding.weight >= 55 ? 'critical' : 'warn',
      title: 'Tek Varlık Riski',
      message: `${maxHolding.symbol} portföyün %${maxHolding.weight.toFixed(0)}'ini oluşturuyor.`,
    });
  }

  if (tryShare >= 80) {
    findings.push({
      id: 'try-heavy',
      severity: 'warn',
      title: 'TL Yoğunluğu',
      message: `Portföyünüz %${tryShare.toFixed(0)} TL varlık. Kripto/döviz çeşitlendirmesi düşünün.`,
    });
  }

  if (cryptoShare >= 50) {
    findings.push({
      id: 'crypto-heavy',
      severity: 'warn',
      title: 'Kripto Ağırlığı',
      message: `Kripto payı %${cryptoShare.toFixed(0)}.`,
    });
  }

  findings.push({
    id: 'yield-live',
    severity: 'info',
    title: 'Temettü Verimi',
    message:
      'Tahmini temettü için Temettü Karnesi sayfasındaki canlı Yahoo verimini kullanın.',
  });

  if (betaIndex >= 1.35) {
    findings.push({
      id: 'beta-high',
      severity: 'warn',
      title: 'Yüksek Beta',
      message: `Portföy beta ~${betaIndex}.`,
    });
  }

  let score = 90;
  for (const f of findings) {
    if (f.severity === 'critical') score -= 20;
    else if (f.severity === 'warn') score -= 12;
  }
  score = Math.max(20, Math.min(98, score));
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
  };
}
