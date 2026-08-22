'use client';

import { Clock, Layers, Shield } from 'lucide-react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';

const POINTS = [
  {
    icon: Clock,
    title: 'Piyasa durmuyor; dikkat dağılır',
    body: 'Haber akışı, endeks ve sosyal medya aynı anda konuşur. Asistan, genel gürültüyü değil sizin taşıdığınız lotu, mevduat vadenizi ve kurduğunuz fiyat hedefini öne alır. Karar yine sizde kalır; eksik olan çoğu zaman bilgi değil, kendi tablonuza dönmektir.',
  },
  {
    icon: Layers,
    title: 'Varlıklar tek uygulamada durmuyor',
    body: 'Hisse aracı kurumda, vadeli mevduat bankada, izleme listesi başka bir ekranda. Parçalı takip, riskin nerede yığıldığını ve nakit yastığın ne kadar olduğunu gizler. Kişisel envanter bu parçaları aynı dilde toplar.',
  },
  {
    icon: Shield,
    title: 'Kurumsal terminaller sizi tanımaz',
    body: 'Profesyonel araçlar herkese aynı grafiği sunar; sizin alış maliyetiniz, faiz oranınız veya alarmınız orada yoktur. Finans asistanı, piyasa verisini sizin kayıtlarınızla yan yana koyar — tavsiye satmaz, bağlam üretir.',
  },
] as const;

export function WhyAssistant() {
  const { openAuth } = useAuthGate();

  return (
    <section
      id="neden-asistan"
      className="scroll-mt-20 border-b border-[var(--border)] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          Finansal okuryazarlık
        </p>
        <h2 className="mt-2 max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl">
          Finansal okuryazarlık, finansal özgürlüğün temelidir
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Ürünler çoğaldı, kararlar yalnızlaştı. Özgürlük; her grafiği izlemek
          değil, kendi lotunu, nakitini ve vadeni okuyabilmektir. Asistan sizi
          yönetmez — bu okuryazarlığı her gün envanterinizde tutar. Bullsye bunu
          genel skor tablosu değil, kişisel tablo olarak kurar.
        </p>

        <ul className="mt-12 grid gap-8 md:grid-cols-3">
          {POINTS.map((p) => (
            <li key={p.title}>
              <div className="grid size-10 place-items-center rounded-xl border border-[var(--accent)]/30 bg-[var(--glow-up)]">
                <p.icon className="size-5 text-[var(--accent)]" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {p.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-12 max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
          <h3 className="text-lg font-semibold tracking-tight">
            Finansal özgürlük için kendi envanterinizi görün
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Lot, nakit, mevduat ve alarmlarınızı tek envanterde tutun. Piyasayı
            kayıtsız izleyebilirsiniz; hesap, finansal okuryazarlığınızı
            destekleyen bu envanterin cihazlar arasında kaybolmaması içindir.
            Kişisel özet, kayıtlı varlıklarınızdan üretilir.
          </p>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Bullsye yatırım tavsiyesi vermez. Getiri veya işlem yönü
            vaat etmez; karar size aittir.
          </p>
          <button
            type="button"
            onClick={() =>
              openAuth({
                tab: 'register',
                feature: 'Neden asistan',
              })
            }
            className="mt-6 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#042f2e] hover:brightness-110"
          >
            Envanterimi oluştur
          </button>
        </div>
      </div>
    </section>
  );
}
