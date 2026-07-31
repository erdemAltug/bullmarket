'use client';

import { Waves } from 'lucide-react';
import { ProtectedFeature } from '@/components/auth/ProtectedFeature';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

const FOREIGN_FLOW = [
  { rank: 1, symbol: 'THYAO', name: 'Türk Hava Yolları', netMtl: 412, unlocked: true },
  { rank: 2, symbol: 'ASELS', name: 'Aselsan', netMtl: 287, unlocked: true },
  { rank: 3, symbol: 'GARAN', name: 'Garanti BBVA', netMtl: 198, unlocked: false },
  { rank: 4, symbol: 'TCELL', name: 'Turkcell', netMtl: 156, unlocked: false },
  { rank: 5, symbol: 'SISE', name: 'Şişecam', netMtl: 134, unlocked: false },
];

const WHALES = [
  { chain: 'BTC', label: 'Balina cüzdanı +1,240 BTC biriktirdi', age: '2s' },
  { chain: 'ETH', label: 'Exchange çıkışı: 48,000 ETH', age: '5s' },
  { chain: 'SOL', label: 'Smart money cüzdanı long açtı', age: '9s' },
];

export default function SmartMoneyPage() {
  const { data: session } = authClient.useSession();
  const unlocked = Boolean(session?.user);

  const visible = FOREIGN_FLOW.filter((r) => unlocked || r.unlocked);
  const locked = FOREIGN_FLOW.filter((r) => !r.unlocked);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Waves className="size-6 text-cyan-400" />
          Balina & Smart Money
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          BİST yabancı / kurumsal takas ve kripto on-chain balina hareketleri
        </p>
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Son 24 saatte BİST&apos;te en çok yabancı toplayan 5 hisse
        </h2>
        <ul className="mt-4 space-y-2">
          {visible.map((r) => (
            <li
              key={r.symbol}
              className="flex items-center justify-between rounded-lg bg-[var(--surface)]/50 px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-400">
                  {r.rank}
                </span>
                <div>
                  <p className="font-semibold">{r.symbol}</p>
                  <p className="text-xs text-[var(--muted)]">{r.name}</p>
                </div>
              </div>
              <p
                className={cn(
                  'text-sm font-bold tabular-nums',
                  r.netMtl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                )}
              >
                +{r.netMtl} Mn ₺
              </p>
            </li>
          ))}
        </ul>

        {!unlocked && locked.length > 0 ? (
          <div className="mt-3">
            <ProtectedFeature featureTitle="Takas & Balina Listesi">
              <ul className="space-y-2">
                {locked.map((r) => (
                  <li
                    key={r.symbol}
                    className="flex justify-between rounded-lg bg-[var(--surface)]/50 px-3 py-2.5"
                  >
                    <span>
                      #{r.rank} {r.symbol}
                    </span>
                    <span>+{r.netMtl} Mn ₺</span>
                  </li>
                ))}
              </ul>
            </ProtectedFeature>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-semibold">On-chain balina uyarıları</h2>
        {unlocked ? (
          <ul className="mt-3 space-y-2">
            {WHALES.map((w) => (
              <li
                key={w.label}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
              >
                <span>
                  <span className="mr-2 font-bold text-violet-400">{w.chain}</span>
                  {w.label}
                </span>
                <span className="text-xs text-[var(--muted)]">{w.age}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3">
            <ProtectedFeature featureTitle="On-chain Balina">
              <ul className="space-y-2">
                {WHALES.map((w) => (
                  <li key={w.label} className="rounded-lg border px-3 py-2 text-sm">
                    {w.chain}: {w.label}
                  </li>
                ))}
              </ul>
            </ProtectedFeature>
          </div>
        )}
      </section>
    </div>
  );
}
