import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDoc } from '@/components/legal/LegalDoc';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları',
  description:
    'Bullsye kullanım koşulları — hizmet kapsamı, sorumluluk sınırları, hesap kuralları ve fikri mülkiyet.',
  alternates: withLangAlternates('/kosullar'),
  openGraph: {
    title: 'Kullanım Koşulları | Bullsye',
    url: `${SITE_URL}/kosullar`,
  },
};

export default function KosullarPage() {
  return (
    <LegalDoc title="Kullanım Koşulları" updated="2 Ağustos 2026">
      <p>
        bullsye.app’e erişerek veya hesap oluşturarak bu koşulları kabul
        etmiş sayılırsınız. Kabul etmiyorsanız hizmeti kullanmayın.
      </p>

      <h2>1. Hizmetin niteliği</h2>
      <p>
        Bullsye; piyasa verisi, tarama, eğitim içeriği ve analiz araçları sunan
        bir bilgilendirme platformudur.{' '}
        <strong className="font-medium text-zinc-200">
          Yatırım tavsiyesi, portföy yönetim hizmeti veya aracı kurum değildir.
        </strong>{' '}
        Emir iletimi yapılmaz. Ayrıntı:{' '}
        <Link href="/yatirim-uyarisi">Yatırım Uyarısı</Link>.
      </p>

      <h2>2. Hesap</h2>
      <ul>
        <li>Doğru bilgi vermek ve hesabı güvende tutmak sizin sorumluluğunuzdadır</li>
        <li>Hizmeti yasadışı, zararlı veya otomasyon kötüye kullanımı için kullanamazsınız</li>
        <li>
          Makul kullanım dışı yoğun istekler rate-limit veya erişim kısıtı ile
          sonuçlanabilir
        </li>
      </ul>

      <h2>3. Veri ve içerik</h2>
      <p>
        Piyasa verileri gecikebilir, eksik kalabilir veya üçüncü taraf
        kaynaklardan gelir. İçerikler “olduğu gibi” sunulur; doğruluk ve
        kesintisizlik garanti edilmez. Eğitim ve blog metinleri genel
        bilgilendirme amaçlıdır.
      </p>

      <h2>4. Fikri mülkiyet</h2>
      <p>
        Bullsye markası, arayüz, skorlama mantığı ve orijinal içerikler bize
        aittir. İzinsiz kopyalama, yeniden satma veya marka taklidi yasaktır.
        Paylaşım kartları kişisel / sosyal kullanım için teşvik edilir.
      </p>

      <h2>5. Sorumluluğun sınırlandırılması</h2>
      <p>
        Platform kullanımından doğan doğrudan veya dolaylı yatırım zararlarından
        Bullsye sorumlu tutulamaz. Zorunlu kanuni haklarınız saklıdır.
      </p>

      <h2>6. Ücretler</h2>
      <p>
        Temel özellikler ücretsiz sunulabilir. İleride ücretli katmanlar
        eklenirse koşullar ve fiyatlar ayrıca duyurulur.
      </p>

      <h2>7. Fesih</h2>
      <p>
        Koşulları ihlalde hesabı askıya alabilir veya sonlandırabiliriz. Siz de
        hesabı bırakabilirsiniz; saklama için{' '}
        <Link href="/kvkk">KVKK</Link> metnine bakın.
      </p>

      <h2>8. Uygulanacak hukuk</h2>
      <p>
        Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda İstanbul
        (Çağlayan) mahkemeleri / icra daireleri yetkilidir (tüketici hakları
        saklıdır).
      </p>

      <h2>9. İletişim</h2>
      <p>
        <a href="mailto:hello@bullsye.app">hello@bullsye.app</a>
      </p>
    </LegalDoc>
  );
}
