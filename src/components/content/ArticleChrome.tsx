'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import type { ContentSection, ToolCta } from '@/content/types';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { cn } from '@/lib/utils';

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      setProgress(height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 bg-zinc-900">
      <div
        className="h-full bg-emerald-500 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function ArticleToc({ sections }: { sections: ContentSection[] }) {
  return (
    <nav
      aria-label="İçindekiler"
      className="sticky top-20 hidden max-h-[70vh] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 lg:block"
    >
      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
        İçindekiler
      </p>
      <ol className="space-y-2 text-sm">
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="text-zinc-400 transition-colors hover:text-emerald-400"
            >
              {i + 1}. {s.heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function renderInlineMarkdown(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <strong key={key++} className="font-semibold text-zinc-200">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      const href = match[3]!;
      const label = match[2]!;
      const external = href.startsWith('http');
      parts.push(
        external ? (
          <a
            key={key++}
            href={href}
            className="font-medium text-emerald-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>
        ) : (
          <Link
            key={key++}
            href={href}
            className="font-medium text-emerald-400 hover:underline"
          >
            {label}
          </Link>
        )
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

export function ToolCtaBox({ cta }: { cta: ToolCta }) {
  return (
    <aside className="my-8 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
        Canlı araç
      </p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{cta.blurb}</p>
      <Link
        href={cta.href}
        className="mt-4 inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-400"
      >
        {cta.label} ↗
      </Link>
    </aside>
  );
}

export function RegisterCtaBanner() {
  const { openAuth } = useAuthGate();

  return (
    <aside className="my-8 rounded-2xl border border-zinc-700 bg-zinc-900/80 p-5 text-center">
      <p className="text-sm font-semibold text-zinc-100">
        Bu stratejiyi canlı grafiklerde uygulamak için Bullsye&apos;a ücretsiz
        kayıt olun.
      </p>
      <button
        type="button"
        onClick={() =>
          openAuth({
            tab: 'register',
            feature: 'Eğitim → Terminal',
            headline: 'Ücretsiz kayıt — terminali aç',
            subtitle:
              'Alarm, izleme listesi ve fırsat masası aynı hesaba senkronlanır.',
          })
        }
        className="mt-3 inline-flex rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-500/25"
      >
        Ücretsiz kayıt ol &amp; başla
      </button>
      <p className="mt-2 text-[11px] text-zinc-500">
        veya{' '}
        <Link href="/firsatlar" className="text-emerald-400 hover:underline">
          Fırsat Masası
        </Link>
        &apos;na git
      </p>
    </aside>
  );
}

export function ArticleMeta({
  minutes,
  date,
  level,
}: {
  minutes: number;
  date: string;
  level?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
      <span>{minutes} dk okuma süresi</span>
      <span aria-hidden>·</span>
      <span>
        {new Date(date).toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </span>
      {level ? (
        <>
          <span aria-hidden>·</span>
          <span className="rounded border border-zinc-700 px-1.5 py-0.5 uppercase">
            {level}
          </span>
        </>
      ) : null}
    </div>
  );
}

export function AuthorBio() {
  return (
    <div className="mt-10 flex gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="grid size-12 place-items-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">
        B
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-100">
          Bullsye Araştırma Ekibi
        </p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          BİST, kripto ve küresel piyasalar üzerine eğitim ve analiz içerikleri
          üreten editöryal ekip. İçerikler yatırım tavsiyesi değildir.
        </p>
      </div>
    </div>
  );
}

export function ArticleBody({
  sections,
  insertCtaAfter = 1,
  cta,
}: {
  sections: ContentSection[];
  insertCtaAfter?: number;
  cta: ToolCta;
}) {
  return (
    <div className="prose-invert max-w-none space-y-8">
      {sections.map((section, idx) => (
        <div key={section.id}>
          <section id={section.id} className="scroll-mt-24">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-50">
              {section.heading}
            </h2>
            {section.paragraphs.map((p) => (
              <p
                key={p.slice(0, 24)}
                className="mt-3 text-sm leading-relaxed text-zinc-400"
              >
                {renderInlineMarkdown(p)}
              </p>
            ))}
            {section.bullets?.length ? (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-zinc-400">
                {section.bullets.map((b) => (
                  <li key={b}>{renderInlineMarkdown(b)}</li>
                ))}
              </ul>
            ) : null}
          </section>
          {idx === insertCtaAfter ? <ToolCtaBox cta={cta} /> : null}
          {idx === Math.min(sections.length - 1, insertCtaAfter + 1) ? (
            <RegisterCtaBanner />
          ) : null}
        </div>
      ))}
      {sections.length - 1 < insertCtaAfter ? <ToolCtaBox cta={cta} /> : null}
    </div>
  );
}

export function FaqBlock({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  if (!faqs.length) return null;
  return (
    <section className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
      <h2 className="text-lg font-semibold text-zinc-100">Sıkça Sorulan Sorular</h2>
      <dl className="mt-4 space-y-4">
        {faqs.map((f) => (
          <div key={f.question}>
            <dt className="text-sm font-medium text-zinc-200">{f.question}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-zinc-400">
              {f.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function LevelBadge({ level }: { level: string }) {
  return (
    <span
      className={cn(
        'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase',
        level === 'baslangic' &&
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        level === 'orta' && 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        level === 'ileri' && 'border-rose-500/30 bg-rose-500/10 text-rose-300'
      )}
    >
      {level}
    </span>
  );
}
