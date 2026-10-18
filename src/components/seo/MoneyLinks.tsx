import Link from 'next/link';
import type { MoneyLink } from '@/lib/seo/money-links';

export function MoneyLinks({ links }: { links: MoneyLink[] }) {
  if (!links.length) return null;

  return (
    <nav className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4" aria-label="İlgili piyasalar">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        İlgili canlı sayfalar
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-block rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-300 hover:border-emerald-400"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
