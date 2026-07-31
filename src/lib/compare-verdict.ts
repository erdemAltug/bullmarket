import type { CompareMetrics } from '@/types';

function label(sym: string) {
  return sym.replace('.IS', '').replace('USDT', '');
}

/** Dinamik 1v1 özet metni — “AI Summary Verdict” */
export function buildCompareVerdict(a: CompareMetrics, b: CompareMetrics): string {
  const parts: string[] = [];
  const la = label(a.symbol);
  const lb = label(b.symbol);

  if (a.trailingPE != null && b.trailingPE != null && b.trailingPE > 0) {
    const cheaper = a.trailingPE < b.trailingPE ? a : b;
    const dearer = cheaper === a ? b : a;
    const pct = Math.abs(
      ((dearer.trailingPE! - cheaper.trailingPE!) / dearer.trailingPE!) * 100
    );
    parts.push(
      `${label(cheaper.symbol)}, ${label(dearer.symbol)}'a göre %${pct.toFixed(0)} daha ucuz F/K çarpanına sahip`
    );
  }

  if (a.earningsGrowth != null && b.earningsGrowth != null) {
    const leader = a.earningsGrowth >= b.earningsGrowth ? a : b;
    const other = leader === a ? b : a;
    const leaderG = leader.earningsGrowth!;
    const otherG = other.earningsGrowth!;
    if (leaderG !== otherG) {
      parts.push(
        `${label(leader.symbol)}'un kâr büyümesi (${(leaderG * 100).toFixed(1)}%) daha yüksek`
      );
    }
  }

  if (a.yearReturn != null && b.yearReturn != null) {
    const leader = a.yearReturn >= b.yearReturn ? a : b;
    const yr = leader.yearReturn!;
    parts.push(
      `Son 1 yılda ${label(leader.symbol)} %${yr.toFixed(1)} getiriyle önde`
    );
  }

  if (a.dividendYield != null && b.dividendYield != null) {
    const leader =
      a.dividendYield >= b.dividendYield ? a : b;
    if ((leader.dividendYield ?? 0) > 0) {
      parts.push(
        `Temettü tarafında ${label(leader.symbol)} (%${(leader.dividendYield! * 100).toFixed(1)}) avantajlı`
      );
    }
  }

  if (!parts.length) {
    return `${la} ile ${lb} kıyaslandı; bazı temel metrikler henüz eksik. Teknik getiri ve mevcut fiyatı birlikte değerlendirin.`;
  }

  return parts.join(' ancak ') + '.';
}
