export type SearchItemKind = 'nav' | 'bist' | 'crypto' | 'fx';

export interface SearchCatalogItem {
  id: string;
  label: string;
  keywords: string;
  kind: SearchItemKind;
  href: string;
}

export const SEARCH_CATALOG: SearchCatalogItem[] = [
  {
    id: 'nav-overview',
    label: 'Overview',
    keywords: 'home dashboard overview',
    kind: 'nav',
    href: '/',
  },
  {
    id: 'nav-bist',
    label: 'BİST',
    keywords: 'bist istanbul stocks',
    kind: 'nav',
    href: '/bist',
  },
  {
    id: 'nav-heatmap',
    label: 'Isı Haritası',
    keywords: 'heatmap ısı haritası bist30',
    kind: 'nav',
    href: '/bist/heatmap',
  },
  {
    id: 'nav-crypto',
    label: 'Crypto',
    keywords: 'crypto bitcoin ethereum',
    kind: 'nav',
    href: '/crypto',
  },
  {
    id: 'nav-fx',
    label: 'Döviz',
    keywords: 'döviz fx dolar euro',
    kind: 'nav',
    href: '/fx/USD-TRY',
  },
  {
    id: 'nav-portfolio',
    label: 'Portföyüm',
    keywords: 'portfolio portföy holdings',
    kind: 'nav',
    href: '/portfolio',
  },
  {
    id: 'xu100',
    label: 'XU100 · BİST 100',
    keywords: 'xu100 bist100 index',
    kind: 'bist',
    href: '/bist/XU100',
  },
  {
    id: 'thyao',
    label: 'THYAO · Türk Hava Yolları',
    keywords: 'thyao thy airlines',
    kind: 'bist',
    href: '/bist/THYAO',
  },
  {
    id: 'garan',
    label: 'GARAN · Garanti BBVA',
    keywords: 'garan garanti bank',
    kind: 'bist',
    href: '/bist/GARAN',
  },
  {
    id: 'asels',
    label: 'ASELS · Aselsan',
    keywords: 'asels aselsan',
    kind: 'bist',
    href: '/bist/ASELS',
  },
  {
    id: 'eregl',
    label: 'EREGL · Ereğli Demir Çelik',
    keywords: 'eregl eregli steel',
    kind: 'bist',
    href: '/bist/EREGL',
  },
  {
    id: 'btc',
    label: 'BTC · Bitcoin',
    keywords: 'btc bitcoin crypto',
    kind: 'crypto',
    href: '/crypto/BTCUSDT',
  },
  {
    id: 'eth',
    label: 'ETH · Ethereum',
    keywords: 'eth ethereum crypto',
    kind: 'crypto',
    href: '/crypto/ETHUSDT',
  },
  {
    id: 'bnb',
    label: 'BNB · BNB',
    keywords: 'bnb binance',
    kind: 'crypto',
    href: '/crypto/BNBUSDT',
  },
  {
    id: 'sol',
    label: 'SOL · Solana',
    keywords: 'sol solana',
    kind: 'crypto',
    href: '/crypto/SOLUSDT',
  },
  {
    id: 'usd',
    label: 'USD/TRY',
    keywords: 'usd dollar döviz fx dolar kaç tl',
    kind: 'fx',
    href: '/fx/USD-TRY',
  },
  {
    id: 'eur',
    label: 'EUR/TRY',
    keywords: 'eur euro döviz fx',
    kind: 'fx',
    href: '/fx/EUR-TRY',
  },
  {
    id: 'gbp',
    label: 'GBP/TRY',
    keywords: 'gbp sterling pound fx',
    kind: 'fx',
    href: '/fx/GBP-TRY',
  },
];
