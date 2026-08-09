import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import {
  ETF_META,
  SCANNER_BIST_SYMBOLS,
  SCANNER_CRYPTO_SYMBOLS,
  SCANNER_ETF_SYMBOLS,
  SCANNER_TEFAS_FUNDS,
  SCANNER_US_SYMBOLS,
} from '../src/lib/scanner-universe';
import type { MarketAsset } from '../src/types/market-asset';

/** Popular display names — improves Fuse recall without live API cost */
const NAME_HINTS: Record<string, string> = {
  THYAO: 'Türk Hava Yolları',
  GARAN: 'Garanti BBVA',
  AKBNK: 'Akbank',
  YKBNK: 'Yapı Kredi',
  ISCTR: 'İş Bankası (C)',
  EREGL: 'Ereğli Demir Çelik',
  BIMAS: 'BİM',
  ASELS: 'Aselsan',
  KCHOL: 'Koç Holding',
  SAHOL: 'Sabancı Holding',
  TUPRS: 'Tüpraş',
  SISE: 'Şişecam',
  TCELL: 'Turkcell',
  TTKOM: 'Türk Telekom',
  PGSUS: 'Pegasus',
  FROTO: 'Ford Otosan',
  TOASO: 'Tofaş',
  AEFES: 'Anadolu Efes',
  CCOLA: 'Coca-Cola İçecek',
  MGROS: 'Migros',
  SOKM: 'Şok Marketler',
  ENKAI: 'Enka İnşaat',
  TAVHL: 'TAV Havalimanları',
  KOZAL: 'Koza Altın',
  AAPL: 'Apple',
  MSFT: 'Microsoft',
  NVDA: 'NVIDIA',
  GOOGL: 'Alphabet',
  AMZN: 'Amazon',
  META: 'Meta Platforms',
  TSLA: 'Tesla',
  NFLX: 'Netflix',
  AMD: 'AMD',
  INTC: 'Intel',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
  BNB: 'BNB',
  XRP: 'XRP',
  DOGE: 'Dogecoin',
  ADA: 'Cardano',
  AVAX: 'Avalanche',
  VOO: 'Vanguard S&P 500 ETF',
  QQQ: 'Invesco QQQ Trust',
  SPY: 'SPDR S&P 500 ETF',
  SCHD: 'Schwab US Dividend Equity',
};

function uniqBySymbol(items: MarketAsset[]): MarketAsset[] {
  const map = new Map<string, MarketAsset>();
  for (const item of items) {
    const key = `${item.category}:${item.symbol}`;
    if (!map.has(key)) map.set(key, item);
  }
  return [...map.values()].sort((a, b) =>
    a.symbol.localeCompare(b.symbol, 'en')
  );
}

function build(): MarketAsset[] {
  const out: MarketAsset[] = [];

  for (const raw of SCANNER_BIST_SYMBOLS) {
    const symbol = raw.replace(/\.IS$/i, '').toUpperCase();
    if (symbol.startsWith('XU')) continue;
    out.push({
      symbol,
      name: NAME_HINTS[symbol] ?? symbol,
      exchange: 'BIST',
      category: 'bist',
      logo: null,
      quoteId: raw.toUpperCase(),
      href: `/bist/${symbol}`,
    });
  }

  for (const raw of SCANNER_US_SYMBOLS) {
    const symbol = raw.toUpperCase();
    out.push({
      symbol,
      name: NAME_HINTS[symbol] ?? symbol,
      exchange: 'NASDAQ/NYSE',
      category: 'us',
      logo: null,
      quoteId: symbol,
      href: `/us/${symbol}`,
    });
  }

  for (const raw of SCANNER_CRYPTO_SYMBOLS) {
    const quoteId = raw.toUpperCase();
    const symbol = quoteId.replace(/USDT$/, '');
    out.push({
      symbol,
      name: NAME_HINTS[symbol] ?? symbol,
      exchange: 'BINANCE',
      category: 'crypto',
      logo: null,
      quoteId,
      href: `/crypto/${quoteId}`,
    });
  }

  for (const raw of SCANNER_ETF_SYMBOLS) {
    const symbol = raw.toUpperCase();
    const meta = ETF_META[symbol];
    out.push({
      symbol,
      name: NAME_HINTS[symbol] ?? meta?.style ?? symbol,
      exchange: 'ETF',
      category: 'etf',
      logo: null,
      quoteId: symbol,
      href: `/fon/${symbol}`,
    });
  }

  for (const fund of SCANNER_TEFAS_FUNDS) {
    const symbol = fund.code.toUpperCase();
    out.push({
      symbol,
      name: `${fund.founder} · ${fund.style}`,
      exchange: 'TEFAS',
      category: 'fon',
      logo: null,
      quoteId: `TEFAS:${symbol}`,
      href: `/fon/${symbol}`,
    });
  }

  return uniqBySymbol(out);
}

const assets = build();
const outPath = path.join(process.cwd(), 'src', 'data', 'market-assets.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(assets, null, 2)}\n`, 'utf8');
console.log(`Wrote ${assets.length} assets → ${outPath}`);
