import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDoc } from '@/components/legal/LegalDoc';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description:
    'Bullsye Kişisel Verilerin Korunması Kanunu (KVKK) aydınlatma metni — veri işleme amaçları, haklarınız ve iletişim.',
  alternates: withLangAlternates('/kvkk'),
  openGraph: {
    title: 'KVKK Aydınlatma Metni | Bullsye',
    url: `${SITE_URL}/kvkk`,
  },
};

export default function KvkkPage() {
  return (
    <LegalDoc title="KVKK Aydınlatma Metni" updated="2 Ağustos 2026">
      <p>
        Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”)
        kapsamında Bullsye (“Platform”, bullsye.app) tarafından kişisel
        verilerinizin işlenmesine ilişkin sizi bilgilendirmek amacıyla
        hazırlanmıştır.
      </p>

      <h2>1. Veri sorumlusu</h2>
      <p>
        Platform işletmecisi Bullsye’dir. Talepleriniz için:{' '}
        <a href="mailto:privacy@bullsye.app">privacy@bullsye.app</a>
      </p>

      <h2>2. İşlenen veriler</h2>
      <ul>
        <li>Kimlik / iletişim: e-posta, ad-soyad (kayıt ve OAuth ile)</li>
        <li>
          Hesap verileri: watchlist, portföy işlemleri, fiyat alarmları
        </li>
        <li>
          Kullanım verileri: oturum, tercih (dil, tema, para birimi), cihaz /
          tarayıcı teknik logları
        </li>
        <li>
          Analitik: Microsoft Clarity (etkinse) ile oturum ısı haritası /
          etkileşim özeti — reklam kimliği satılmaz
        </li>
      </ul>

      <h2>3. İşleme amaçları ve hukuki sebepler</h2>
      <ul>
        <li>Hizmet sunumu ve hesap yönetimi (sözleşmenin ifası)</li>
        <li>Güvenlik, kötüye kullanım önleme (meşru menfaat)</li>
        <li>Alarm / bildirim e-postası (açık rıza / hizmet ifası)</li>
        <li>Ürün iyileştirme ve hata ayıklama (meşru menfaat)</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
      </ul>

      <h2>4. Aktarım</h2>
      <p>
        Veriler; barındırma (ör. Neon / Vercel), kimlik doğrulama ve e-posta
        gönderim (Resend, yapılandırıldıysa) sağlayıcılarına, yalnızca hizmet
        için gerekli ölçüde aktarılabilir. Yurt dışı aktarımda KVKK’daki
        uygun güvenceler gözetilir.
      </p>

      <h2>5. Saklama süresi</h2>
      <p>
        Hesap aktif olduğu sürece ve yasal zamanaşımı / uyuşmazlık süreleri
        boyunca; silme talebinde makul süre içinde imha veya anonimleştirme
        uygulanır (yasal saklama zorunlulukları saklıdır).
      </p>

      <h2>6. Haklarınız (KVKK md. 11)</h2>
      <p>
        Verilerinizin işlenip işlenmediğini öğrenme, düzeltme, silme, itiraz,
        aktarım bilgisini talep etme haklarına sahipsiniz. Başvuru:{' '}
        <a href="mailto:privacy@bullsye.app">privacy@bullsye.app</a>
      </p>

      <h2>7. İlgili metinler</h2>
      <p>
        Ayrıntılar için <Link href="/gizlilik">Gizlilik Politikası</Link> ve{' '}
        <Link href="/kosullar">Kullanım Koşulları</Link> sayfalarına bakın.
      </p>
    </LegalDoc>
  );
}
