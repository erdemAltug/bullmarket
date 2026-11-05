import Link from 'next/link';
import { Eye, Lock, Scale, Users } from 'lucide-react';
import { Reveal } from '@/components/landing/Reveal';

const PRINCIPLES = [
  {
    icon: Eye,
    title: 'Yöntemimiz açık',
    line: 'Skorun hangi verilerden ve nasıl hesaplandığını herkesin okuyabileceği şekilde yazdık. Kara kutu yok.',
    href: '/metodoloji',
    cta: 'Skor nasıl hesaplanır',
  },
  {
    icon: Scale,
    title: 'Tavsiye değil, bilgi',
    line: 'Al ya da sat demiyoruz. Veriyi sadeleştirip önüne koyuyoruz; kararı sen veriyorsun.',
    href: '/yatirim-uyarisi',
    cta: 'Yatırım uyarısı',
  },
  {
    icon: Lock,
    title: 'Verin sende kalır',
    line: 'Portföyün ve listen sadece sana görünür. Verini satmıyoruz, reklam çerezleri onayın olmadan açılmaz.',
    href: '/gizlilik',
    cta: 'Gizlilik',
  },
];

const AUDIENCE = [
  'Gün içinde ekran başında olamayan çalışan yatırımcılar',
  'Borsaya yeni başlayıp nereden başlayacağını bilmeyenler',
  'BİST, ABD hissesi, fon ve kriptoyu tek yerden izlemek isteyenler',
];

/** Who we are, why we exist and what we promise — trust before the pitch. */
export function AboutBullsye() {
  return (
    <section id="biz-kimiz" className="scroll-mt-20 border-b border-[var(--border)] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Biz kimiz</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Bireysel yatırımcı için piyasa takip asistanı
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              <p>
                Bullsye&apos;ı, kendi birikimini yöneten ama bütün gün grafik izleyecek
                vakti olmayan insanlar için kurduk. Piyasada veri çok, zaman az:
                yüzlerce hisse, onlarca gösterge, sürekli akan haber.
              </p>
              <p>
                Biz bu gürültüyü her gün tarıyoruz. Her hisseyi fiyat hareketi, gün içi konum,
                işlem hacmi ve değerlemeden oluşan{' '}
                <strong className="font-semibold text-[var(--foreground)]">0–100 arası tek bir skora</strong>{' '}
                indiriyoruz. Önemli bir şey olduğunda e-postanla haber veriyoruz.
                Amacımız sana ne alacağını söylemek değil, neye bakman gerektiğini
                hızla göstermek.
              </p>
            </div>
            <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold">
                <Users className="size-4 text-[var(--accent)]" /> Kimler için?
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-[var(--muted)]">
                {AUDIENCE.map((a) => (
                  <li key={a} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <div className="space-y-3">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 120}>
                <div className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-[var(--accent)]/40">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10">
                    <p.icon className="size-5 text-[var(--accent)]" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold">{p.title}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{p.line}</p>
                    <Link href={p.href} className="mt-2 inline-block text-xs font-medium text-[var(--accent)] hover:underline">
                      {p.cta} →
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={400}>
              <p className="px-1 text-xs leading-relaxed text-[var(--muted)]">
                Veri kaynakları: Borsa İstanbul ve ABD piyasa verileri, Binance, TEFAS,
                TCMB ve şirketlerin KAP açıklamaları. Fiyatlar gecikmeli olabilir.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
