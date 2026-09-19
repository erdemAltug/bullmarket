import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { getUserAlerts } from '@/actions/alerts';
import { getUserPortfolio } from '@/actions/portfolio';
import { getUserWatchlist } from '@/actions/watchlist';
import { buildCompanionNotes } from '@/lib/companion';
import { analyzePortfolioHealth } from '@/lib/portfolio-health';
import type { PortfolioPosition } from '@/types';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

function costBasisTry(p: PortfolioPosition): number {
  const fx = p.currency === 'USD' ? 34 : 1; // rough; context only
  return p.buyPrice * p.quantity * fx;
}

function displaySym(s: string) {
  return s.replace(/\.IS$/i, '').replace(/USDT$/i, '');
}

/** Soft retrieve: keyword → egitim/blog snippet (no embeddings). */
export function retrieveKnowledgeSnippet(query: string): string | null {
  const q = query.toLowerCase();
  const needles: { keys: string[]; file: string }[] = [
    {
      keys: ['temettü', 'temettu', 'verim', 'dividend'],
      file: 'egitim/temettu-verimi-nasil-yorumlanir.md',
    },
    {
      keys: ['f/k', 'fk', 'çarpan', 'carpan', 'değerleme'],
      file: 'blog/fk-orani-nedir-bist.md',
    },
    {
      keys: ['bilanço', 'bilanco', 'roe', 'pd/dd'],
      file: 'blog/bilanco-nasil-okunur-bist.md',
    },
    {
      keys: ['skor', 'tarama', 'radar'],
      file: 'egitim/analiz-skoru-nasil-okunur.md',
    },
    {
      keys: ['kıyas', 'karsilastir', 'karşılaştır', 'peer'],
      file: 'blog/iki-hisse-nasil-karsilastirilir.md',
    },
  ];

  const hit = needles.find((n) => n.keys.some((k) => q.includes(k)));
  if (!hit) return null;
  const full = path.join(CONTENT_ROOT, hit.file);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, 'utf8');
  const body = raw.replace(/^---[\s\S]*?---\s*/, '').trim();
  return body.slice(0, 700);
}

function extractSymbols(message: string, held: string[]): string[] {
  const fromMsg = [
    ...message.toUpperCase().matchAll(/\b([A-Z]{3,5})(?:\.IS)?\b/g),
  ].map((m) => m[1]);
  const crypto = message.toUpperCase().match(/\b(BTC|ETH|SOL|XRP|AVAX|BNB)\b/g);
  const set = new Set<string>([
    ...fromMsg,
    ...(crypto ?? []),
    ...held.map(displaySym).slice(0, 5),
  ]);
  return [...set].slice(0, 6);
}

export type AsistanContextPack = {
  systemExtra: string;
  userLabel: string;
  positionCount: number;
};

export async function buildAsistanContextPack(input: {
  userId: string;
  email?: string | null;
  name?: string | null;
  message: string;
}): Promise<AsistanContextPack> {
  const [portfolio, alertsRes, watchRes] = await Promise.all([
    getUserPortfolio(input.userId),
    getUserAlerts(input.userId),
    getUserWatchlist(input.userId),
  ]);

  const positions = portfolio.positions;
  const alerts = alertsRes.alerts;
  const watchlist = watchRes.symbols;

  const liveValues: Record<string, number> = {};
  const costValues: Record<string, number> = {};
  let totalCost = 0;
  for (const p of positions) {
    const c = costBasisTry(p);
    costValues[p.id] = c;
    liveValues[p.id] = c; // canlı yoksa maliyet = proxy
    totalCost += c;
  }

  const health = analyzePortfolioHealth(
    positions,
    liveValues,
    costValues,
    totalCost || 1
  );

  const notes = buildCompanionNotes({
    positions,
    alerts,
    watchlist,
    totalValue: totalCost,
    depositValue: positions
      .filter((p) => p.assetClass === 'deposit')
      .reduce((s, p) => s + costBasisTry(p), 0),
    cashValue: positions
      .filter((p) => p.assetClass === 'cash')
      .reduce((s, p) => s + costBasisTry(p), 0),
    pnlPct: 0,
  });

  const held = positions
    .filter((p) => p.assetClass === 'bist' || p.assetClass === 'crypto')
    .map((p) => p.symbol);

  const lines = positions.slice(0, 25).map((p) => {
    const cost = costBasisTry(p);
    return `- ${displaySym(p.symbol)} (${p.assetClass}) adet=${p.quantity} maliyet≈₺${Math.round(cost)}`;
  });

  const alertLines = alerts.slice(0, 10).map(
    (a) =>
      `- ${a.displaySymbol} · ${a.kind} · eşik ${a.threshold}${a.triggered ? ' (tetiklendi)' : ''}`
  );

  const knowledge = retrieveKnowledgeSnippet(input.message);
  const mentioned = extractSymbols(input.message, held);

  const userLabel =
    input.name?.trim() ||
    input.email?.split('@')[0] ||
    'kayıtlı kullanıcı';

  const systemExtra = [
    `Kullanıcı: ${userLabel} (id kısaltması: ${input.userId.slice(0, 8)}…)`,
    `Envanter: ${positions.length} satır · maliyet toplamı≈₺${Math.round(totalCost)} (canlı fiyat yoksa maliyet proxy)`,
    `Sağlık skoru: ${health.score}/100 — ${health.label}`,
    health.findings.length
      ? `Bulgular:\n${health.findings
          .slice(0, 4)
          .map((f) => `  • [${f.severity}] ${f.title}: ${f.message}`)
          .join('\n')}`
      : 'Bulgu yok.',
    lines.length ? `Pozisyonlar:\n${lines.join('\n')}` : 'Pozisyon yok.',
    alertLines.length
      ? `Alarmlar:\n${alertLines.join('\n')}`
      : 'Alarm yok.',
    watchlist.length
      ? `İzleme: ${watchlist.slice(0, 12).map(displaySym).join(', ')}`
      : 'İzleme listesi boş.',
    notes.length
      ? `Companion notları:\n${notes.map((n) => `  • ${n.title}: ${n.body}`).join('\n')}`
      : '',
    mentioned.length
      ? `Mesajda geçen / ilgili semboller: ${mentioned.join(', ')} — derin rakam yoksa /bist/{SYM} veya /firsatlar öner.`
      : '',
    knowledge
      ? `Bilgi notu (eğitim/blog özeti, tavsiye değil):\n${knowledge}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    systemExtra,
    userLabel,
    positionCount: positions.length,
  };
}
