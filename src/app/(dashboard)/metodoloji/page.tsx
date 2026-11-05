import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDoc } from '@/components/legal/LegalDoc';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { hubOgImages } from '@/lib/seo/og';

const TITLE = 'Analiz Skoru Metodolojisi: Bullsye Skoru Nasıl Hesaplanır?';
const DESCRIPTION =
  'Bullsye 0–100 analiz skorunun hangi verilerden ve nasıl hesaplandığı, ne sıklıkla güncellendiği, veri kaynakları ve sınırları. Açık ve sade anlatım.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: withLangAlternates('/metodoloji'),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/metodoloji`,
    images: hubOgImages('Skor nasıl hesaplanır?', 'Bullsye analiz skoru metodolojisi'),
  },
};

const H2 = 'text-lg font-semibold text-zinc-100';

export default function MetodolojiPage() {
  return (
    <LegalDoc title="Analiz skoru nasıl hesaplanır?" updated="5 Kasım 2026">
      <p>
        Bullsye analiz skoru, bir hisse, coin veya fonun o günkü görünümünü 0 ile
        100 arasında tek bir sayıyla özetler. Amacı, yüzlerce enstrüman arasından
        <strong className="font-medium text-zinc-200"> bugün neye bakmaya değer </strong>
        sorusuna hızlı bir başlangıç noktası vermektir. Skor bir al-sat tavsiyesi
        değildir; bu sayfada nasıl hesaplandığını açıkça anlatıyoruz.
      </p>

      <h2 className={H2}>Skoru oluşturan 4 bileşen</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="font-medium text-zinc-200">Günlük fiyat hareketi (momentum):</strong>{' '}
          Gün içinde belirgin yükselen enstrümanlar puan kazanır, sert düşenler puan kaybeder.
        </li>
        <li>
          <strong className="font-medium text-zinc-200">Gün içi bant konumu:</strong>{' '}
          Fiyatın günün en düşük ve en yüksek seviyesi arasında nerede durduğu. Günün dip
          bölgesine yakın fiyatlar toparlanma potansiyeli için puan alır, zirveye çok
          yakın fiyatlar bir miktar puan kaybeder.
        </li>
        <li>
          <strong className="font-medium text-zinc-200">İşlem hacmi:</strong>{' '}
          Likiditesi yüksek enstrümanlar daha fazla puan alır. Hacmin etkisi logaritmik
          ölçeklenir; çok büyük hacim skoru sınırsız şişirmez.
        </li>
        <li>
          <strong className="font-medium text-zinc-200">Değerleme (F/K):</strong>{' '}
          Fiyat/kazanç oranı düşük hisseler puan kazanır, çok yüksek olanlar puan kaybeder.
          F/K verisi olmayan enstrümanlarda (kripto, fonlar) bu bileşen nötrdür.
        </li>
      </ul>
      <p>
        Bileşenler orta bir başlangıç değerine eklenip çıkarılır ve sonuç 12 ile 98
        arasına sınırlanır. Aynı kurallar her enstrümana uygulanır; elle müdahale ya da
        ücretli öne çıkarma yoktur.
      </p>

      <h2 className={H2}>Ne sıklıkla güncellenir?</h2>
      <p>
        Sunucumuz Borsa İstanbul, ABD hisseleri, kripto paralar, ETF&apos;ler ve seçili
        TEFAS fonlarından oluşan 1.000&apos;den fazla enstrümanı yaklaşık 15 dakikada bir
        tarar. Her günün son ölçümü saklanır; hisse sayfalarındaki
        <strong className="font-medium text-zinc-200"> skor geçmişi</strong> grafiği bu
        kayıtlardan çizilir.
      </p>

      <h2 className={H2}>Veri kaynakları</h2>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Hisse, ETF ve kripto fiyatları: piyasa veri sağlayıcıları (hisselerde 15 dakikaya kadar gecikmeli olabilir)</li>
        <li>Yatırım fonları: TEFAS</li>
        <li>Döviz kurları: TCMB</li>
        <li>Analist hedef fiyatları: aracı kurum konsensüsü (skorda kullanılmaz, ayrı gösterilir)</li>
      </ul>

      <h2 className={H2}>Skorun sınırları</h2>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Skor o günün verisine dayanır; şirketin uzun vadeli değerini ölçmez.</li>
        <li>Bilanço kalitesi, borçluluk, yönetim ve sektör riskleri skora dahil değildir.</li>
        <li>Haber akışı veya KAP açıklamaları skoru doğrudan etkilemez.</li>
        <li>Veri gecikmesi veya hatalı veri, skoru geçici olarak etkileyebilir.</li>
      </ul>
      <p>
        Bu yüzden skoru bir filtre olarak kullanmanı öneriyoruz: ilgini çeken hisseyi
        bulduktan sonra{' '}
        <Link href="/targets" className="text-emerald-400 hover:underline">analist hedef fiyatlarını</Link>,{' '}
        <Link href="/blog/bilanco-nasil-okunur-bist" className="text-emerald-400 hover:underline">bilançosunu</Link>{' '}
        ve{' '}
        <Link href="/blog/kap-bildirimi-nasil-okunur" className="text-emerald-400 hover:underline">KAP açıklamalarını</Link>{' '}
        incele.
      </p>

      <h2 className={H2}>Skoru nerede görebilirim?</h2>
      <ul className="list-disc space-y-1.5 pl-5">
        <li><Link href="/bist/en-yuksek-skorlu-hisseler" className="text-emerald-400 hover:underline">En yüksek skorlu BİST hisseleri</Link></li>
        <li><Link href="/nasdaq/en-yuksek-skorlu-hisseler" className="text-emerald-400 hover:underline">En yüksek skorlu ABD hisseleri</Link></li>
        <li><Link href="/kripto/en-yuksek-skorlu-coinler" className="text-emerald-400 hover:underline">En yüksek skorlu coinler</Link></li>
        <li>Her hissenin kendi sayfasında, skor geçmişiyle birlikte</li>
      </ul>

      <p className="text-xs">
        Bu sayfa bilgilendirme amaçlıdır. Bullsye SPK düzenlemeleri kapsamında yatırım
        danışmanlığı yapmaz. Ayrıntılar için{' '}
        <Link href="/yatirim-uyarisi" className="text-emerald-400 hover:underline">yatırım uyarısı</Link>.
      </p>
    </LegalDoc>
  );
}
