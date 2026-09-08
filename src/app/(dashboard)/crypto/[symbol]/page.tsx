import { permanentRedirect } from 'next/navigation';

type Props = { params: Promise<{ symbol: string }> };

/** Legacy — canonical is /kripto/[SYMBOL] */
export default async function LegacyCryptoSymbol({ params }: Props) {
  let symbol = (await params).symbol.toUpperCase();
  if (!symbol.endsWith('USDT') && !symbol.endsWith('USD')) {
    symbol = `${symbol}USDT`;
  }
  permanentRedirect(`/kripto/${symbol}`);
}
