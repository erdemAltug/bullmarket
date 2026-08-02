import Link from 'next/link';
import { SITE_URL } from '@/lib/seo/symbols';

const LEGAL_LINKS = [
  { href: '/kvkk', label: 'KVKK' },
  { href: '/gizlilik', label: 'Gizlilik' },
  { href: '/kosullar', label: 'Kullanım Koşulları' },
  { href: '/yatirim-uyarisi', label: 'Yatırım Uyarısı' },
] as const;

const PRODUCT_LINKS = [
  { href: '/firsatlar', label: 'Fırsat Masası' },
  { href: '/bist', label: 'BİST' },
  { href: '/signals', label: 'AI Sinyaller' },
  { href: '/fon', label: 'Fonlar & ETF' },
  { href: '/egitim', label: 'Eğitim' },
  { href: '/blog', label: 'Blog' },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950/40">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-tight text-zinc-100">
              Bullsye
            </p>
            <p className="text-xs leading-relaxed text-zinc-500">
              Canlı BİST, kripto ve fon analizi — karar odaklı finans terminali.
            </p>
            <p className="text-[11px] text-zinc-600">
              <a
                href={SITE_URL}
                className="hover:text-emerald-400"
              >
                bullsye.app
              </a>
            </p>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Terminal
            </p>
            <ul className="grid grid-cols-2 gap-1.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-zinc-400 transition-colors hover:text-emerald-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Hukuki
            </p>
            <ul className="space-y-1.5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-zinc-400 transition-colors hover:text-emerald-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-[11px] leading-relaxed text-amber-200/90">
            <span className="font-semibold text-amber-300">Yatırım uyarısı: </span>
            Bullsye bir analiz ve bilgilendirme platformudur; SPK kapsamında
            yatırım tavsiyesi değildir. Sermaye piyasası işlemleri risk içerir;
            geçmiş performans gelecek getirinin göstergesi değildir. Kararlar
            size aittir.
          </p>
        </div>

        <p className="mt-6 text-center text-[10px] text-zinc-600">
          © {year} Bullsye. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}

export { LEGAL_LINKS };
