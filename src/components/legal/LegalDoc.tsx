import Link from 'next/link';
import type { ReactNode } from 'react';
import { LEGAL_LINKS } from '@/components/shared/SiteFooter';

export function LegalDoc({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3 border-b border-zinc-800 pb-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
          Hukuki
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          {title}
        </h1>
        <p className="text-xs text-zinc-500">Son güncelleme: {updated}</p>
        <nav className="flex flex-wrap gap-2 pt-1">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md border border-zinc-800 px-2.5 py-1 text-[11px] text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-400"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="legal-prose space-y-6 text-sm leading-relaxed text-zinc-400 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-100 [&_h3]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-zinc-200 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:text-emerald-400 [&_a]:hover:underline">
        {children}
      </div>
    </article>
  );
}
