import { permanentRedirect } from 'next/navigation';

type Props = { params: Promise<{ symbol: string }> };

/** Legacy — canonical is /nasdaq/[SYMBOL] */
export default async function LegacyUsSymbol({ params }: Props) {
  const symbol = (await params).symbol.toUpperCase();
  permanentRedirect(`/nasdaq/${symbol}`);
}
