import type { Metadata } from 'next';
import { AsistanChat } from '@/components/asistan/AsistanChat';

export const metadata: Metadata = {
  title: 'Portföy Asistanı',
  description:
    'Kayıtlı envanterine göre soru-cevap. Yatırım tavsiyesi değildir. İndekslenmez.',
  robots: { index: false, follow: false },
};

export default function AsistanPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Portföy asistanı
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Envanter, alarm ve izleme listeni tanıyan sohbet. Rakamlar senden;
          model sadece açıklar. Al/sat demez.
        </p>
      </div>
      <AsistanChat />
    </div>
  );
}
