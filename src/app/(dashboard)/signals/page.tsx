'use client';

import { AISignalRadar } from '@/components/dashboard/AISignalRadar';
import { useMarketScanner } from '@/hooks/useMarketScanner';

export default function SignalsPage() {
  const scanner = useMarketScanner();

  return (
    <div className="space-y-6">
      <AISignalRadar
        marketItems={scanner.data ?? []}
        isLoading={scanner.isLoading}
        freeCount={3}
      />
      {scanner.error ? (
        <p className="text-sm text-rose-400">{scanner.error.message}</p>
      ) : null}
      {scanner.updatedAt ? (
        <p className="text-center text-[10px] text-[var(--muted)]">
          Canlı feed · son güncelleme{' '}
          {new Date(scanner.updatedAt).toLocaleTimeString('tr-TR')}
        </p>
      ) : null}
    </div>
  );
}
