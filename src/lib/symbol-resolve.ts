import {
  SCANNER_BIST_SYMBOLS,
  SCANNER_CRYPTO_SYMBOLS,
  SCANNER_US_SYMBOLS,
} from '@/lib/scanner-universe';

export type AssetMarket = 'bist' | 'us' | 'crypto';

export interface ResolvedSymbol {
  input: string;
  display: string;
  yahoo: string | null;
  binance: string | null;
  market: AssetMarket;
}

const US_SET = new Set(
  SCANNER_US_SYMBOLS.map((s) => s.toUpperCase())
);
const BIST_BASE = new Set(
  SCANNER_BIST_SYMBOLS.map((s) => s.replace(/\.IS$/i, '').toUpperCase())
);
const CRYPTO_BASE = new Set(
  SCANNER_CRYPTO_SYMBOLS.map((s) => s.replace(/USDT$/i, '').toUpperCase())
);

const CRYPTO_ALIASES: Record<string, string> = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  BNB: 'BNBUSDT',
  SOL: 'SOLUSDT',
  XRP: 'XRPUSDT',
  DOGE: 'DOGEUSDT',
  ADA: 'ADAUSDT',
  AVAX: 'AVAXUSDT',
};

/** Normalize user input → Yahoo / Binance symbols + market class */
export function resolveSymbol(raw: string): ResolvedSymbol {
  const input = raw.trim().toUpperCase();
  if (!input) {
    return {
      input: '',
      display: '',
      yahoo: null,
      binance: null,
      market: 'bist',
    };
  }

  if (input.endsWith('USDT') || CRYPTO_ALIASES[input] || CRYPTO_BASE.has(input)) {
    const binance =
      CRYPTO_ALIASES[input] ??
      (input.endsWith('USDT') ? input : `${input}USDT`);
    const base = binance.replace(/USDT$/, '');
    return {
      input,
      display: base,
      yahoo: `${base}-USD`,
      binance,
      market: 'crypto',
    };
  }

  if (input.endsWith('.IS')) {
    return {
      input,
      display: input.replace(/\.IS$/, ''),
      yahoo: input,
      binance: null,
      market: 'bist',
    };
  }

  if (US_SET.has(input) || input.includes('.')) {
    return {
      input,
      display: input,
      yahoo: input,
      binance: null,
      market: 'us',
    };
  }

  if (BIST_BASE.has(input)) {
    return {
      input,
      display: input,
      yahoo: `${input}.IS`,
      binance: null,
      market: 'bist',
    };
  }

  // Unknown bare ticker → prefer US/NASDAQ (Yahoo resolves AAPL, TPIC, etc.)
  // Explicit BIST still via .IS suffix or known universe.
  return {
    input,
    display: input,
    yahoo: input,
    binance: null,
    market: 'us',
  };
}

export interface SymbolPick {
  symbol: string;
  label: string;
  market: AssetMarket;
  keywords: string;
}

/** Autocomplete universe: BİST + NASDAQ + crypto */
export function buildSymbolUniverse(): SymbolPick[] {
  const picks: SymbolPick[] = [];

  for (const s of SCANNER_BIST_SYMBOLS) {
    const base = s.replace(/\.IS$/i, '');
    if (base === 'XU100') continue;
    picks.push({
      symbol: base,
      label: `${base} · BİST`,
      market: 'bist',
      keywords: `${base} bist istanbul`,
    });
  }

  for (const s of SCANNER_US_SYMBOLS) {
    picks.push({
      symbol: s,
      label: `${s} · NASDAQ`,
      market: 'us',
      keywords: `${s} nasdaq us stock`,
    });
  }

  for (const s of SCANNER_CRYPTO_SYMBOLS) {
    const base = s.replace(/USDT$/i, '');
    picks.push({
      symbol: base,
      label: `${base} · Kripto`,
      market: 'crypto',
      keywords: `${base} ${s} crypto`,
    });
  }

  return picks;
}

export function filterSymbolUniverse(query: string, limit = 12): SymbolPick[] {
  const q = query.trim().toUpperCase();
  if (!q) {
    return buildSymbolUniverse().slice(0, limit);
  }
  return buildSymbolUniverse()
    .filter(
      (p) =>
        p.symbol.includes(q) ||
        p.keywords.toUpperCase().includes(q) ||
        p.label.toUpperCase().includes(q)
    )
    .slice(0, limit);
}

export function normalizeYieldPct(raw: number | null | undefined): number | null {
  if (raw == null || !Number.isFinite(raw)) return null;
  return raw > 1 ? raw : raw * 100;
}
