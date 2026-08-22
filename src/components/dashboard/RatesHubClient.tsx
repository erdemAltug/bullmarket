'use client';

import { ExternalLink, Percent } from 'lucide-react';
import { useCalendar, useRatesDesk } from '@/hooks/useIntelligence';
import { cn, formatPercent } from '@/lib/utils';
import { ListSkeleton } from '@/components/ui/skeleton';
import type { RatePoint } from '@/types';

const PRIMERS = [
  {
    title: 'TCMB politika faizi',
    body: 'Türkiye’de kısa vadeli fonlama maliyetinin referansı PPK kararlarıdır. Mevduat ve ihtiyaç/taşıt/konut kredi fiyatları buna gecikmeli yaklaşır; bireysel oran bankaya ve vadeye göre değişir.',
  },
  {
    title: 'Mevduat vs kredi',
    body: 'Mevduat faizi sizin bankaya verdiğiniz fonun fiyatı, kredi faizi aldığınız fonun fiyatıdır. Aradaki fark marjdır. Karşılaştırırken yıllık yüzde, masraf ve vade aynı dilimde okunmalıdır.',
  },
  {
    title: 'Fed ve tahvil',
    body: 'ABD’de politika faizi FOMC ile; piyasa ise T-bill ve 2–10 yıl tahvil getirisiyle fiyatlar. 10 yıllık getiri, uzun vadeli iskonto ve risk iştahı için yaygın bir barometredir — al/sat sinyali değildir.',
  },
  {
    title: 'ECB ve euro',
    body: 'Euro Bölgesi refinansman faizi ECB kararıdır. EUR/USD, faiz farkı ve risk iştahını birlikte taşır. Kur hareketi tek başına kredi kararı üretmez.',
  },
] as const;

function formatValue(p: RatePoint): string {
  if (p.unit === '%') {
    return `%${p.value.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return p.value.toLocaleString('tr-TR', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

export function RatesHubClient() {
  const { data, isLoading, error } = useRatesDesk();
  const cal = useCalendar();
  const points = data?.points ?? [];
  const news = data?.news ?? [];
  const rateEvents = (cal.data?.events ?? []).filter((e) =>
    /faiz|rate|fomc|tcmb|ecb|interest|kredi|ppi|cpi|enflasyon/i.test(
      `${e.title} ${e.detail ?? ''}`
    )
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Faiz & Kredi
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Türkiye ve dünyada politika faizi, tahvil getirisi ve kur. Haber ve
          takvim bağlam içindir; kredi veya mevduat tavsiyesi değildir.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-rose-400">{error.message}</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && !points.length
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl border border-[var(--border)] bg-[var(--card)]"
              />
            ))
          : points.map((p) => {
              const up = p.changePercent >= 0;
              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                >
                  <p className="text-xs font-medium text-[var(--muted)]">
                    {p.region} · {p.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums">
                    {formatValue(p)}
                  </p>
                  <p
                    className={cn(
                      'mt-1 text-xs font-semibold',
                      up ? 'text-[var(--up)]' : 'text-[var(--down)]'
                    )}
                  >
                    {formatPercent(p.changePercent)}
                  </p>
                </div>
              );
            })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PRIMERS.map((p) => (
          <article
            key={p.title}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <h2 className="text-sm font-semibold">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {p.body}
            </p>
          </article>
        ))}
      </div>

      <section>
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
          <Percent className="size-4 text-teal-300" />
          Faiz ve kredi haberleri
        </h2>
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          {isLoading && !news.length ? (
            <div className="p-4">
              <ListSkeleton rows={5} />
            </div>
          ) : !news.length ? (
            <p className="p-4 text-sm text-[var(--muted)]">Haber alınamadı.</p>
          ) : (
            news.map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3 last:border-0 hover:bg-[var(--surface)]/50"
              >
                <div className="min-w-0">
                  <p className="text-[11px] text-[var(--muted)]">
                    {item.source} ·{' '}
                    {new Date(item.publishedAt).toLocaleString('tr-TR')}
                  </p>
                  <p className="mt-0.5 text-sm leading-snug">{item.title}</p>
                </div>
                <ExternalLink className="mt-1 size-3.5 shrink-0 text-[var(--muted)]" />
              </a>
            ))
          )}
        </div>
      </section>

      {rateEvents.length ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold">Yakın makro takvim</h2>
          <ul className="space-y-2 rounded-xl border border-[var(--border)] p-4">
            {rateEvents.slice(0, 8).map((e) => (
              <li key={e.id} className="flex justify-between gap-3 text-sm">
                <span>
                  <span className="mr-2 text-[10px] font-semibold text-teal-300">
                    {e.region}
                  </span>
                  {e.title}
                </span>
                <span className="shrink-0 tabular-nums text-[var(--muted)]">
                  {new Date(e.at).toLocaleString('tr-TR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-xs text-[var(--muted)]">
        Tahvil getirileri CBOE endekslerinden (Yahoo). TCMB/PPK resmi oranı
        için tcmb.gov.tr. Yatırım veya kredi tavsiyesi değildir.
      </p>
    </div>
  );
}
