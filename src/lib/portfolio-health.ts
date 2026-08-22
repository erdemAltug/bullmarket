import type {
  AssetClass,
  HealthFinding,
  PortfolioHealthReport,
  PortfolioPosition,
} from '@/types';

/** liveValues[id] = live TRY value, costValues[id] = cost basis TRY */
export function analyzePortfolioHealth(
  positions: PortfolioPosition[],
  liveValues: Record<string, number>,
  costValues: Record<string, number>,
  totalValue: number
): PortfolioHealthReport {
  const findings: HealthFinding[] = [];

  if (!positions.length || totalValue <= 0) {
    return {
      score: 50,
      label: 'Boş portföy',
      findings: [
        {
          id: 'empty',
          severity: 'info',
          title: 'Pozisyon yok',
          message:
            'Sağlık skoru için en az bir pozisyon ekleyin. Çeşitlendirme ile başlayın.',
        },
      ],
    };
  }

  const bySymbol = new Map<string, number>();
  for (const p of positions) {
    const v = liveValues[p.id] ?? 0;
    bySymbol.set(p.symbol, (bySymbol.get(p.symbol) ?? 0) + v);
  }

  let maxShare = 0;
  let maxSym = '';
  for (const [sym, v] of bySymbol) {
    const share = (v / totalValue) * 100;
    if (share > maxShare) {
      maxShare = share;
      maxSym = sym;
    }
  }

  if (maxShare >= 50) {
    findings.push({
      id: 'conc-critical',
      severity: 'critical',
      title: 'Aşırı Yoğunlaşma Riski',
      message: `Portföyünüzün %${maxShare.toFixed(0)}'i tek bir varlıkta (${maxSym.replace('.IS', '').replace('USDT', '')}). Çeşitlendirme yapmanız önerilir.`,
    });
  } else if (maxShare >= 35) {
    findings.push({
      id: 'conc-warn',
      severity: 'warn',
      title: 'Yoğunlaşma Uyarısı',
      message: `${maxSym.replace('.IS', '').replace('USDT', '')} portföyün %${maxShare.toFixed(0)}'ini oluşturuyor. Ağırlığı dengelemeyi düşünün.`,
    });
  }

  const classSum: Record<AssetClass, number> = {
    bist: 0,
    crypto: 0,
    gold: 0,
    cash: 0,
    deposit: 0,
  };
  for (const p of positions) {
    classSum[p.assetClass] += liveValues[p.id] ?? 0;
  }
  const safePct =
    ((classSum.cash + classSum.deposit + classSum.gold) / totalValue) * 100;
  const riskHeavy =
    (classSum.bist + classSum.crypto) / totalValue >= 0.9 && safePct < 8;

  if (riskHeavy) {
    findings.push({
      id: 'hedge',
      severity: 'warn',
      title: 'Sektörel / Varlık Riski',
      message:
        'Portföyünüzde anlamlı döviz/altın koruması yok; tamamen BİST/Kripto ağırlıklı. Küçük bir hedge dilimi düşünebilirsiniz.',
    });
  }

  for (const p of positions) {
    const live = liveValues[p.id] ?? 0;
    const basis = costValues[p.id] ?? 0;
    if (basis <= 0 || live <= 0) continue;
    const pct = ((live - basis) / basis) * 100;
    if (pct >= 40) {
      findings.push({
        id: `tp-${p.id}`,
        severity: 'info',
        title: 'Kâr Realizasyonu Hatırlatıcı',
        message: `${p.symbol.replace('.IS', '').replace('USDT', '')} pozisyonunuz %${pct.toFixed(0)}+ kârda. Stop-loss seviyenizi yukarı çekmeyi veya kâr almayı düşünebilirsiniz.`,
      });
    }
  }

  if (!findings.length) {
    findings.push({
      id: 'ok',
      severity: 'info',
      title: 'Dengeli görünüm',
      message:
        'Belirgin yoğunlaşma veya hedge açığı tespit edilmedi. Periyodik rebalance yapmaya devam edin.',
    });
  }

  let score = 88;
  for (const f of findings) {
    if (f.severity === 'critical') score -= 22;
    else if (f.severity === 'warn') score -= 12;
    else if (f.id.startsWith('tp-')) score -= 2;
  }
  score = Math.max(25, Math.min(98, score));

  const label =
    score >= 80 ? 'Dengeli' : score >= 60 ? 'Orta risk' : 'Yüksek risk';

  return { score, label, findings };
}
