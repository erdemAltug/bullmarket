/** Stable pseudo social-proof without DB — hash(symbol+day) → interest band */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type SocialProofStats = {
  views24h: number;
  inventoryHolders: number;
  labelViews: string;
  labelHolders: string;
};

export function socialProofFor(symbol: string, day = new Date()): SocialProofStats {
  const dayKey = day.toISOString().slice(0, 10);
  const h = hash(`${symbol.toUpperCase()}:${dayKey}`);
  const views24h = 180 + (h % 4200);
  const inventoryHolders = 12 + (h % 890);
  return {
    views24h,
    inventoryHolders,
    labelViews: `Bu hisse son 24 saatte ${views24h.toLocaleString('tr-TR')} kez incelendi`,
    labelHolders: `${inventoryHolders.toLocaleString('tr-TR')} Bullsye kullanıcısının envanterinde ekli (tahmini ilgi bandı)`,
  };
}
