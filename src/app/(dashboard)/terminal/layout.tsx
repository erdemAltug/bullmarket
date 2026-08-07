import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terminal',
  description:
    'Bullsye canlı finans terminali — BİST, kripto, döviz, fırsat radarı ve watchlist.',
};

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
