import {
  SEO_BIST_TICKERS,
  SEO_CRYPTO_SYMBOLS,
  SEO_FX_PAIRS,
  SEO_US_TICKERS,
} from '@/lib/seo/symbols';

/** Crawlable detail URL for sitemap / internal links */
export function assetDetailHref(
  symbol: string,
  category?: 'BIST' | 'CRYPTO' | 'US' | 'FON' | 'ETF' | string
): string | null {
  const s = symbol.trim().toUpperCase();
  if (!s) return null;

  if (category === 'FON' || s.startsWith('TEFAS:')) {
    return `/fon/${s.replace(/^TEFAS:/, '')}`;
  }

  if (category === 'ETF') {
    return `/fon/${s.replace(/\.IS$/i, '')}`;
  }

  if (category === 'CRYPTO' || s.endsWith('USDT')) {
    const pair = s.endsWith('USDT') ? s : `${s.replace(/[^A-Z0-9]/g, '')}USDT`;
    return `/crypto/${pair}`;
  }

  if (category === 'US') {
    return `/us/${s.replace(/\.IS$/i, '')}`;
  }

  if (category === 'BIST') {
    return `/bist/${s.replace(/\.IS$/i, '')}`;
  }

  const bare = s.replace(/\.IS$/i, '').replace(/^TEFAS:/, '');
  if (bare.includes('-') && SEO_FX_PAIRS.includes(bare as (typeof SEO_FX_PAIRS)[number])) {
    return `/fx/${bare}`;
  }

  if (SEO_US_TICKERS.includes(bare as (typeof SEO_US_TICKERS)[number])) {
    return `/us/${bare}`;
  }

  return `/bist/${bare}`;
}

export const SEO_HUB_FEATURES_TR = [
  {
    href: '/bist',
    title: 'BİST Canlı Fiyat & Grafik',
    desc: 'Borsa İstanbul hisseleri, XU100 ve ısı haritası anlık takip.',
  },
  {
    href: '/us',
    title: 'NASDAQ & ABD Hisseleri',
    desc: 'AAPL, NVDA, TSLA ve ABD blue-chip’leri canlı fiyat + analist hedefi.',
  },
  {
    href: '/fon',
    title: "TEFAS Fonlar & ETF'ler",
    desc: 'AFT, YAY, VOO, QQQ — yatırım fonu ve küresel ETF canlı takip.',
  },
  {
    href: '/crypto',
    title: 'Kripto Sinyal Radarı',
    desc: 'BTC, ETH ve altcoinler için canlı fiyat, RSI ve derinlik.',
  },
  {
    href: '/firsatlar',
    title: 'AI Fırsat Alımları',
    desc: 'Anlık skor, gün içi bant ve yüksek potansiyelli AL fırsat masası.',
  },
  {
    href: '/signals',
    title: 'Canlı Alım Sinyalleri',
    desc: 'RSI, SMA ve momentum tabanlı akıllı al/sat kartları.',
  },
  {
    href: '/targets',
    title: 'Analist Hedef Fiyatları',
    desc: 'Kurum konsensüsü, potansiyel prim ve tavsiye dağılımı.',
  },
  {
    href: '/dividends',
    title: 'Temettü Takvimi',
    desc: 'BİST temettü verimleri, ex-date ve ödeme takvimi.',
  },
  {
    href: '/compare',
    title: '1v1 Hisse & Kripto Kıyaslama',
    desc: 'F/K, PD/DD, büyüme ve temettüyü kafa kafaya karşılaştırın.',
  },
] as const;

export const SEO_HUB_FEATURES_EN = [
  {
    href: '/bist',
    title: 'Live BIST Stocks & Charts',
    desc: 'Real-time Istanbul equities, XU100 and market heatmap.',
  },
  {
    href: '/us',
    title: 'NASDAQ & US Equities',
    desc: 'AAPL, NVDA, TSLA and US blue-chips with live quotes & analyst targets.',
  },
  {
    href: '/fon',
    title: 'TEFAS Funds & Global ETFs',
    desc: 'AFT, YAY, VOO, QQQ — mutual funds and ETF live desk.',
  },
  {
    href: '/crypto',
    title: 'Crypto Signal Radar',
    desc: 'BTC, ETH and alts with live price, RSI and order book depth.',
  },
  {
    href: '/firsatlar',
    title: 'AI Opportunity Desk',
    desc: 'Live scores, intraday bands and high-conviction buy setups.',
  },
  {
    href: '/signals',
    title: 'AI Trading Signals',
    desc: 'RSI, SMA and momentum-based smart buy/sell cards.',
  },
  {
    href: '/targets',
    title: 'Analyst Price Targets',
    desc: 'Broker consensus, upside potential and rating mix.',
  },
  {
    href: '/dividends',
    title: 'Dividend Calendar',
    desc: 'BIST yields, ex-dates and payout schedule.',
  },
  {
    href: '/compare',
    title: '1v1 Stock & Crypto Compare',
    desc: 'Side-by-side P/E, P/B, growth and dividend metrics.',
  },
] as const;

export const TOP_BIST_FOR_HUB = SEO_BIST_TICKERS.filter((s) => s !== 'XU100').slice(
  0,
  24
);

export const TOP_CRYPTO_FOR_HUB = SEO_CRYPTO_SYMBOLS.slice(0, 8);

export const TOP_US_FOR_HUB = SEO_US_TICKERS.slice(0, 16);
