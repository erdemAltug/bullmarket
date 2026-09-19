import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { getUserAlerts } from '@/actions/alerts';
import { getUserPortfolio } from '@/actions/portfolio';
import { getUserWatchlist } from '@/actions/watchlist';
import { fetchFundamentals, fetchQuotes } from '@/lib/api/yahoo';
import { buildCompanionNotes } from '@/lib/companion';
import { analyzePortfolioHealth } from '@/lib/portfolio-health';
import { toYahooSymbol, isIndexedBistSymbol, isIndexedUsSymbol } from '@/lib/seo/symbols';
import type { PortfolioPosition } from '@/types';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

const STOP_TOKENS = new Set([
  'VAR', 'YOK', 'BIR', 'BU', 'SU', 'NE', 'MI', 'MU', 'MÜ', 'ILE', 'ICIN',
  'BEN', 'SEN', 'AMA', 'VEYA', 'HER', 'DAHA', 'NASIL', 'NEDEN',
  'GENEL', 'FIKIR', 'HAKKINDA', 'SORUYORUM', 'DUSUNUYOR', 'DUSUNUYORSUN',
]);

function costBasisTry(p: PortfolioPosition): number {
  const fx = p.currency === 'USD' ? 34 : 1;
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

function extractSymbols(text: string): string[] {
  const fromMsg = [
    ...text.toUpperCase().matchAll(/\b([A-Z]{3,5})(?:\.IS)?\b/g),
  ]
    .map((m) => m[1])
    .filter((s) => !STOP_TOKENS.has(s));
  const crypto = text.toUpperCase().match(/\b(BTC|ETH|SOL|XRP|AVAX|BNB)\b/g);
  return [...new Set([...fromMsg, ...(crypto ?? [])])].slice(0, 4);
}

async function snapshotSymbols(symbols: string[]): Promise<string> {
  if (!symbols.length) return '';
  const lines: string[] = [];
  for (const raw of symbols) {
    const r = await resolveQuotedSymbol(raw);
    if (!r) {
      lines.push(
        `- ${displaySym(raw)}: tanınamadı / canlı veri yok — tahmin etme; piyasa belirsiz`
      );
      continue;
    }
    const pe = r.fund?.trailingPE;
    const parts = [
      `${r.display} (${r.name})`,
      `piyasa=${r.market}`,
      `yahoo=${r.yahoo}`,
      r.price != null ? `fiyat≈${r.price} ${r.currency}` : null,
      r.changePercent != null ? `gün %${r.changePercent.toFixed(2)}` : null,
      pe != null ? `F/K≈${pe.toFixed(1)}` : null,
      `sayfa=${r.href}`,
    ].filter(Boolean);
    lines.push(`- ${parts.join(' · ')}`);
  }
  return lines.length
    ? `Sohbette geçen sembol anlık özeti (tavsiye değil; piyasa alanına uy):\n${lines.join('\n')}`
    : '';
}

type ResolvedQuote = {
  display: string;
  yahoo: string;
  market: 'BIST' | 'NASDAQ' | 'US' | 'UNKNOWN';
  href: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  currency: string;
  fund: Awaited<ReturnType<typeof fetchFundamentals>> | null;
};

async function resolveQuotedSymbol(raw: string): Promise<ResolvedQuote | null> {
  const display = displaySym(raw).toUpperCase();
  const candidates: {
    yahoo: string;
    market: ResolvedQuote['market'];
    href: string;
  }[] = [];

  if (isIndexedBistSymbol(display)) {
    candidates.push({
      yahoo: toYahooSymbol(display),
      market: 'BIST',
      href: `/bist/${display}`,
    });
  } else if (isIndexedUsSymbol(display)) {
    candidates.push({
      yahoo: display,
      market: 'NASDAQ',
      href: `/nasdaq/${display}`,
    });
  } else {
    // Allowlist dışı: önce ABD (çıplak ticker), sonra BİST .IS
    candidates.push(
      { yahoo: display, market: 'US', href: `/nasdaq/${display}` },
      {
        yahoo: toYahooSymbol(display),
        market: 'BIST',
        href: `/bist/${display}`,
      }
    );
  }

  for (const c of candidates) {
    try {
      const [q, fund] = await Promise.all([
        fetchQuotes([c.yahoo]).then((r) => r[0]).catch(() => null),
        fetchFundamentals(c.yahoo).catch(() => null),
      ]);
      if (!q || !(q.price > 0)) continue;
      const market: ResolvedQuote['market'] =
        c.market === 'US' && !c.yahoo.endsWith('.IS')
          ? 'NASDAQ'
          : c.market === 'US'
            ? 'UNKNOWN'
            : c.market;
      return {
        display,
        yahoo: c.yahoo,
        market: c.yahoo.endsWith('.IS') ? 'BIST' : market,
        href: c.yahoo.endsWith('.IS') ? `/bist/${display}` : `/nasdaq/${display}`,
        name: q.name || display,
        price: q.price,
        changePercent: q.changePercent,
        currency: q.currency === 'USD' ? 'USD' : 'TRY',
        fund,
      };
    } catch {
      /* next candidate */
    }
  }
  return null;
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
  historyText?: string;
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
    liveValues[p.id] = c;
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

  const lines = positions.slice(0, 25).map((p) => {
    const cost = costBasisTry(p);
    return `- ${displaySym(p.symbol)} (${p.assetClass}) adet=${p.quantity} maliyet≈₺${Math.round(cost)}`;
  });

  const alertLines = alerts.slice(0, 10).map(
    (a) =>
      `- ${a.displaySymbol} · ${a.kind} · eşik ${a.threshold}${a.triggered ? ' (tetiklendi)' : ''}`
  );

  const knowledge = retrieveKnowledgeSnippet(input.message);
  const mentioned = extractSymbols(
    `${input.historyText ?? ''}\n${input.message}`
  );
  const heldDisp = new Set(
    positions.map((p) => displaySym(p.symbol).toUpperCase())
  );
  const symbolSnap = await snapshotSymbols(mentioned);

  const userLabel =
    input.name?.trim() ||
    input.email?.split('@')[0] ||
    'kayıtlı kullanıcı';

  const systemExtra = [
    `Kullanıcı: ${userLabel}`,
    `Envanter: ${positions.length} satır · maliyet toplamı≈₺${Math.round(totalCost)}`,
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
      ? `Soru sembolleri: ${mentioned.join(', ')}${
          mentioned.some((s) => !heldDisp.has(s.toUpperCase()))
            ? ' (bazıları envanterde değil — yine de genel çerçeve anlat)'
            : ''
        }`
      : '',
    symbolSnap,
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
