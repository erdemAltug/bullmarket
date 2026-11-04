import { HubSeoBlock, SIGNALS_HUB_SEO } from '@/components/seo/HubSeoBlock';
import { SignalsHubClient } from './SignalsHubClient';

export default function SignalsPage() {
  return (
    <>
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          BİST ve kripto teknik sinyaller
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          RSI, hareketli ortalama, momentum ve destek/direnç seviyeleri canlı
          verilerle. Bilgilendirme amaçlıdır; yatırım tavsiyesi değildir.
        </p>
      </header>
      <SignalsHubClient />
      <HubSeoBlock content={SIGNALS_HUB_SEO} />
    </>
  );
}
