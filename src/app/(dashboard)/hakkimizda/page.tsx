import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDoc } from '@/components/legal/LegalDoc';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { hubOgImages } from '@/lib/seo/og';

const TITLE = 'Hakkımızda: Bullsye Nedir, Kimin İçin, Neden Var?';
const DESCRIPTION =
  'Bullsye, bireysel yatırımcılar için BİST, ABD hisseleri, kripto ve fonları tek yerden takip eden ücretsiz bir piyasa takip asistanıdır. Amacımız, ilkelerimiz ve iletişim.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: withLangAlternates('/hakkimizda'),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/hakkimizda`,
    images: hubOgImages('Hakkımızda', 'Bireysel yatırımcı için piyasa takip asistanı'),
  },
};

const H2 = 'text-lg font-semibold text-zinc-100';

export default function HakkimizdaPage() {
  return (
    <LegalDoc title="Hakkımızda" updated="5 Kasım 2026">
      <p>
        Bullsye, kendi birikimini yöneten ama bütün gün ekran başında olamayan bireysel
        yatırımcılar için kurulmuş bir{' '}
        <strong className="font-medium text-zinc-200">piyasa takip asistanıdır</strong>.
        Borsa İstanbul, ABD hisseleri, kripto paralar ve yatırım fonlarını tek bir yerden
        izlemeyi, sade Türkçe ile anlamayı ve önemli bir şey olduğunda haberdar olmayı
        kolaylaştırır.
      </p>

      <h2 className={H2}>Neden kurduk?</h2>
      <p>
        Piyasada veri çok, zaman az. Yüzlerce hisse, onlarca gösterge, sürekli akan haber
        ve her biri ayrı bir sitede. Profesyonel terminaller pahalı ve karmaşık; ücretsiz
        siteler ise ya sadece fiyat gösteriyor ya da reklamla dolu. Bullsye bu ikisinin
        arasındaki boşluğu doldurmak için var: veriyi sadeleştirmek, önceliklendirmek ve
        kararı yatırımcıya bırakmak.
      </p>

      <h2 className={H2}>Ne yapıyoruz?</h2>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>1.000&apos;den fazla hisse, coin ve fonu yaklaşık 15 dakikada bir tarıyoruz.</li>
        <li>
          Her birini <Link href="/metodoloji" className="text-emerald-400 hover:underline">açık bir yöntemle</Link>{' '}
          0–100 arası bir analiz skoruna indiriyoruz.
        </li>
        <li>Analist hedef fiyatlarını, temettü takvimini ve bilanço verilerini tek sayfada topluyoruz.</li>
        <li>Fiyat alarmları ve her sabah gönderilen özetle seni haberdar ediyoruz.</li>
        <li>
          <Link href="/egitim" className="text-emerald-400 hover:underline">Eğitim</Link> ve{' '}
          <Link href="/blog" className="text-emerald-400 hover:underline">blog</Link> bölümlerinde
          borsayı sıfırdan anlatıyoruz.
        </li>
      </ul>

      <h2 className={H2}>İlkelerimiz</h2>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>
          <strong className="font-medium text-zinc-200">Tavsiye değil, bilgi.</strong> Al ya da sat
          demiyoruz. Bullsye SPK düzenlemeleri kapsamında yatırım danışmanlığı yapmaz.
        </li>
        <li>
          <strong className="font-medium text-zinc-200">Açık yöntem.</strong> Skorun nasıl
          hesaplandığını herkesin okuyabileceği şekilde yayımlıyoruz; ücretli öne çıkarma yok.
        </li>
        <li>
          <strong className="font-medium text-zinc-200">Verin sende.</strong> Portföyün ve listen
          yalnızca sana görünür, verini satmıyoruz. Ayrıntılar{' '}
          <Link href="/gizlilik" className="text-emerald-400 hover:underline">gizlilik politikasında</Link>.
        </li>
        <li>
          <strong className="font-medium text-zinc-200">Önce ücretsiz.</strong> Takip için gereken
          temel araçlar ücretsizdir. Daha fazlasını isteyenler için{' '}
          <Link href="/pro" className="text-emerald-400 hover:underline">Pro</Link> planını hazırlıyoruz.
        </li>
      </ul>

      <h2 className={H2}>Veri kaynaklarımız</h2>
      <p>
        Hisse, ETF ve kripto fiyatlarını piyasa veri sağlayıcılarından; fon, döviz ve
        şirket açıklamalarını TEFAS, TCMB ve KAP gibi resmi kaynaklardan topluyor, kendi
        skor modelimizle işliyoruz.
        Fiyatlar gecikmeli olabilir; işlem kararı vermeden önce aracı kurumunuzdaki fiyatı
        kontrol edin.
      </p>

      <h2 className={H2}>İletişim</h2>
      <p>
        Öneri, hata bildirimi veya iş birliği için{' '}
        <a href="mailto:destek@bullsye.app" className="text-emerald-400 hover:underline">
          destek@bullsye.app
        </a>{' '}
        adresine yazabilirsin. Her mesajı okuyoruz.
      </p>
    </LegalDoc>
  );
}
