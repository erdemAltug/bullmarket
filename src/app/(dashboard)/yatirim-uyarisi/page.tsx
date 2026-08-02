import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDoc } from '@/components/legal/LegalDoc';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'Yatırım Uyarısı ve Risk Bildirimi',
  description:
    'Bullsye yatırım tavsiyesi değildir. Sermaye piyasası riskleri, veri gecikmesi ve sorumluluk reddi hakkında bilgilendirme.',
  alternates: withLangAlternates('/yatirim-uyarisi'),
  openGraph: {
    title: 'Yatırım Uyarısı | Bullsye',
    url: `${SITE_URL}/yatirim-uyarisi`,
  },
};

export default function YatirimUyarisiPage() {
  return (
    <LegalDoc title="Yatırım Uyarısı" updated="2 Ağustos 2026">
      <p>
        Bullsye üzerinde gördüğünüz fiyatlar, skorlar, AI sinyalleri, fırsat
        kartları, hedef fiyatlar ve eğitim içerikleri{' '}
        <strong className="font-medium text-zinc-200">
          genel bilgilendirme ve analiz aracıdır
        </strong>
        ; Sermaye Piyasası Kurulu düzenlemeleri kapsamında kişisel yatırım
        tavsiyesi değildir.
      </p>

      <h2>Riskler</h2>
      <ul>
        <li>Hisse, fon, kripto ve döviz işlemleri anapara kaybı riski taşır</li>
        <li>Kaldıraçlı ürünler kaybı büyütebilir</li>
        <li>Likidite, kur ve karşı taraf riskleri mevcuttur</li>
        <li>Geçmiş getiri gelecekteki performansı garanti etmez</li>
      </ul>

      <h2>Veri ve sinyal</h2>
      <p>
        Canlı veriler gecikebilir veya kesintiye uğrayabilir. Teknik skorlar ve
        sinyaller istatistiksel / kural tabanlı taramadır; “al” veya “sat”
        emri değildir. Karar vermeden önce kendi araştırmanızı yapın ve gerekiyorsa
        lisanslı bir uzmana danışın.
      </p>

      <h2>Sorumluluk</h2>
      <p>
        Bullsye’yi kullanarak aldığınız kararların sonuçlarından yalnızca siz
        sorumlusunuz. Ayrıntılı çerçeve:{' '}
        <Link href="/kosullar">Kullanım Koşulları</Link>.
      </p>
    </LegalDoc>
  );
}
