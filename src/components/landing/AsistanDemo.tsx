'use client';

import { useEffect, useState } from 'react';
import { Lock, MessageSquare } from 'lucide-react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const DEMO: { role: 'user' | 'assistant'; text: string; delay: number }[] = [
  {
    role: 'user',
    text: 'Portföyümde yoğunlaşma var mı?',
    delay: 400,
  },
  {
    role: 'assistant',
    text: 'Hesabına göre THYAO ≈ %42 ağırlıkta — yoğunlaşma uyarısı. Bu bir sat sinyali değil; çeşitlendirme seçeneğini sen tartarsın.',
    delay: 1200,
  },
  {
    role: 'user',
    text: 'Alarmlarım uyumlu mu?',
    delay: 2200,
  },
  {
    role: 'assistant',
    text: 'GARAN ve EREGL için fiyat alarmın var; taşıdığın diğer 2 sembolde hedef yok. İstersen /alerts’ten ekle.',
    delay: 3000,
  },
];

export function AsistanDemo() {
  const { openAuth } = useAuthGate();
  const { data: session } = authClient.useSession();
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const timers = DEMO.map((m, i) =>
      window.setTimeout(() => setVisible(i + 1), m.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const signedIn = Boolean(session?.user);

  return (
    <section
      id="asistan"
      className="scroll-mt-20 border-b border-[var(--border)] py-16 sm:py-20"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Finansal asistan
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
            Sizi tanıyan finansal asistanınız
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Hesabınızdaki pozisyonlar, nakit ve alarmlarla konuşur. Hedef fiyat,
            yoğunlaşma ve boğa–ayı çerçevesini sizin veriniz üzerinden özetler.
           
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {signedIn ? (
              <Link
                href="/asistan"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#042f2e] hover:brightness-110"
              >
                <MessageSquare className="size-4" />
                Asistana git
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  openAuth({
                    tab: 'register',
                    feature: 'Portföy asistanı',
                    headline: 'Finansal asistanınızı açın',
                    subtitle:
                      'Hesabınıza bağlanır; pozisyon ve alarmlarınızla konuşur. Yatırım tavsiyesi değildir.',
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#042f2e] hover:brightness-110"
              >
                <Lock className="size-4" />
                Ücretsiz başla
              </button>
            )}
            <Link
              href="/asistan"
              className="inline-flex items-center rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Nasıl çalışır
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[var(--accent)]/25 bg-[var(--card)] shadow-[0_0_40px_rgba(20,184,166,0.1)]">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5">
            <MessageSquare className="size-3.5 text-[var(--accent)]" />
            <span className="text-xs font-medium">Asistan</span>
          </div>
          <div className="space-y-2.5 p-4 min-h-[220px]">
            {DEMO.slice(0, visible).map((m, i) => (
              <div
                key={i}
                className={cn(
                  'max-w-[88%] rounded-lg px-3 py-2 text-xs leading-relaxed',
                  m.role === 'user'
                    ? 'ml-auto bg-[var(--accent)]/15'
                    : 'bg-[var(--surface)] text-[var(--muted)]'
                )}
              >
                {m.text}
              </div>
            ))}
            {visible < DEMO.length ? (
              <p className="text-[10px] text-[var(--muted)]">…</p>
            ) : null}
          </div>
          {!signedIn ? (
            <div className="border-t border-[var(--border)] bg-[var(--surface)]/80 px-4 py-3 text-center">
              <p className="text-[11px] text-[var(--muted)]">
                Kişisel yanıtlar için ücretsiz hesap
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
