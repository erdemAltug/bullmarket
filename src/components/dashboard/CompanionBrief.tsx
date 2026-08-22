import Link from 'next/link';
import type { CompanionNote } from '@/lib/companion';

export function CompanionBrief({ notes }: { notes: CompanionNote[] }) {
  if (!notes.length) return null;

  return (
    <section className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <h2 className="text-sm font-semibold tracking-tight text-emerald-300">
          Sana özel özet
        </h2>
        <p className="mt-0.5 text-[11px] text-[var(--muted)]">
          Envanterinden üretilir; yatırım tavsiyesi değildir
        </p>
      <ul className="mt-3 space-y-3">
        {notes.map((n) => (
          <li key={n.id}>
            <p className="text-sm font-medium text-[var(--foreground)]">
              {n.title}
            </p>
            <p className="mt-0.5 text-sm leading-relaxed text-[var(--muted)]">
              {n.body}
            </p>
            {n.href ? (
              <Link
                href={n.href}
                className="mt-1 inline-block text-xs text-emerald-400 hover:underline"
              >
                Aç →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
