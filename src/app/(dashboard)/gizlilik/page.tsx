import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDoc } from '@/components/legal/LegalDoc';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description:
    'Bullsye gizlilik politikası — hangi verileri nasıl topladığımız, çerezler, analitik ve haklarınız.',
  alternates: withLangAlternates('/gizlilik'),
  openGraph: {
    title: 'Gizlilik Politikası | Bullsye',
    url: `${SITE_URL}/gizlilik`,
  },
};

export default function GizlilikPage() {
  return (
    <LegalDoc title="Gizlilik Politikası" updated="2 Ağustos 2026">
      <p>
        Bullsye olarak gizliliğinize saygı duyarız. Bu politika, web sitemiz ve
        terminal hizmetlerimizde kişisel verilerin nasıl toplandığını ve
        kullanıldığını açıklar.
      </p>

      <h2>1. Topladığımız bilgiler</h2>
      <ul>
        <li>Hesap oluştururken verdiğiniz e-posta ve profil bilgileri</li>
        <li>Platformda kaydettiğiniz listeler, portföy ve alarmlar</li>
        <li>
          Teknik veriler (IP, tarayıcı tipi, yaklaşık konum — altyapı logları)
        </li>
        <li>
          İsteğe bağlı analitik (Clarity): sayfa gezinme ve tıklama özetleri
        </li>
      </ul>

      <h2>2. Kullanım</h2>
      <p>
        Bilgileri hesabınızı işletmek, alarm e-postası göndermek, güvenliği
        sağlamak ve ürün deneyimini iyileştirmek için kullanırız. Verilerinizi
        üçüncü taraflara satmayız.
      </p>

      <h2>3. Çerezler ve yerel depolama</h2>
      <p>
        Oturum, dil/tema tercihleri ve bazı izleme listeleri tarayıcı
        depolamasında tutulabilir. Analitik çerezleri yalnızca ilgili araç
        etkinleştirildiğinde çalışır.
      </p>

      <h2>4. Güvenlik</h2>
      <p>
        Endüstri standardı barındırma ve erişim kontrolleri uygulanır. İnternet
        üzerinden iletimin %100 güvenliği garanti edilemez; güçlü parola ve
        hesabınızı paylaşmama sizin sorumluluğunuzdadır.
      </p>

      <h2>5. Çocuklar</h2>
      <p>
        Hizmet 18 yaş altı kişilere yönelik değildir. Bilerek çocuk verisi
        toplamayız.
      </p>

      <h2>6. Değişiklikler</h2>
      <p>
        Bu metin güncellenebilir. Önemli değişikliklerde sayfa tarihi yenilenir;
        gerekirse hesap e-postası ile bilgilendirme yapılır.
      </p>

      <h2>7. İletişim</h2>
      <p>
        <a href="mailto:privacy@bullsye.app">privacy@bullsye.app</a> ·{' '}
        <Link href="/kvkk">KVKK Aydınlatma Metni</Link>
      </p>
    </LegalDoc>
  );
}
