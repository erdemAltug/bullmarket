export type MoneyLink = { href: string; label: string };

const BIST: MoneyLink[] = [
  { href: '/bist/THYAO', label: 'THYAO canlı fiyat' },
  { href: '/bist/GARAN', label: 'GARAN canlı fiyat' },
  { href: '/targets', label: 'Analist hedef fiyatları' },
  { href: '/dividends', label: 'Temettü takvimi' },
];

const TEKNIK: MoneyLink[] = [
  { href: '/signals', label: 'Canlı alım sinyalleri' },
  { href: '/bist/ASELS', label: 'ASELS analiz karnesi' },
  { href: '/karsilastir/akbnk-vs-garan', label: 'AKBNK ve GARAN kıyası' },
  { href: '/bist/THYAO', label: 'THYAO canlı fiyat' },
];

const KRIPTO: MoneyLink[] = [
  { href: '/kripto/BTCUSDT', label: 'BTC canlı fiyat' },
  { href: '/kripto/ETHUSDT', label: 'ETH canlı fiyat' },
  { href: '/kripto', label: 'Kripto radarı' },
];

const DEFAULT_LINKS: MoneyLink[] = [
  { href: '/bist', label: 'BİST canlı fiyatlar' },
  { href: '/targets', label: 'Hedef fiyatlar' },
  { href: '/karsilastir/pgsus-vs-thyao', label: 'PGSUS ve THYAO kıyası' },
];

export function moneyLinksForLesson(category: string): MoneyLink[] {
  if (category === 'borsa-temelleri') return BIST;
  if (category === 'teknik-analiz') return TEKNIK;
  if (category === 'kripto-risk') return KRIPTO;
  return DEFAULT_LINKS;
}

export function moneyLinksForPost(input: {
  title: string;
  tags: string[];
  keywords?: string[];
}): MoneyLink[] {
  const blob = [input.title, ...input.tags, ...(input.keywords ?? [])]
    .join(' ')
    .toLocaleLowerCase('tr');

  const links: MoneyLink[] = [];
  if (/temettü|temettu|dividend/.test(blob)) {
    links.push(
      { href: '/dividends', label: 'Temettü takvimi' },
      { href: '/bist/THYAO/temettu', label: 'THYAO temettü' }
    );
  }
  if (/hedef|analist|konsensüs|konsensus/.test(blob)) {
    links.push(
      { href: '/targets', label: 'Analist hedef fiyatları' },
      { href: '/bist/GARAN/hedef-fiyat', label: 'GARAN hedef fiyat' }
    );
  }
  if (/rsi|sinyal|teknik|golden|macd/.test(blob)) {
    links.push(
      { href: '/signals', label: 'Canlı sinyaller' },
      { href: '/bist/ASELS', label: 'ASELS analiz karnesi' }
    );
  }
  if (/kripto|bitcoin|btc|eth/.test(blob)) {
    links.push(
      { href: '/kripto/BTCUSDT', label: 'BTC canlı fiyat' },
      { href: '/kripto/ETHUSDT', label: 'ETH canlı fiyat' }
    );
  }
  if (/kıyas|kiyas|karşılaştır|karsilastir|f\/k|fk oranı/.test(blob)) {
    links.push({
      href: '/karsilastir/akbnk-vs-garan',
      label: 'AKBNK ve GARAN kıyası',
    });
  }
  if (/bilanço|bilanco|f\/k/.test(blob)) {
    links.push({ href: '/bist/THYAO/bilanco', label: 'THYAO bilanço karnesi' });
  }

  if (links.length === 0) return DEFAULT_LINKS;
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  }).slice(0, 4);
}
