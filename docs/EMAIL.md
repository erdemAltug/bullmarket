# E-posta (Resend — ücretsiz katman)

Alarm tetiklenince tarayıcı bildirimine ek olarak e-posta gönderilir.

## Ücretsiz kotası

Resend free: günde ~100 / ayda ~3000 transactional e-posta — ilk ay kayıt toplamak için yeterli.

## Kurulum

1. [resend.com](https://resend.com) hesabı açın
2. API key oluşturun
3. Domain doğrulayın (veya test için `onboarding@resend.dev` — yalnızca kendi hesabınıza test)
4. Env:

```env
RESEND_API_KEY=re_xxx
RESEND_FROM="Bullsye <alarm@sizin-domaininiz.com>"
```

5. Deploy sonrası giriş yapmış kullanıcıda alarm kurup tetikleyin → `/api/alerts/notify`

## Notlar

- Key yoksa e-posta sessizce atlanır (ürün bozulmaz)
- Sentry yok; Clarity ile kullanım izlenir
- Sekme kapalıyken: `.github/workflows/alerts-cron.yml` 10 dakikada bir `GET /api/cron/alerts` çağırır

## Sabah özeti (hafta içi 08:30)

Kayıtlı kullanıcı `/alerts` sayfasındaki **Sabah özeti e-postası** kartından açar.
Liste `digest_subscriptions` tablosunda tutulur; her e-postada tek tık çıkış linki
(`/api/digest/unsubscribe?token=…`) ve `List-Unsubscribe` başlığı vardır.

1. Şemayı uygulayın: `npm run db:push` (`digest_subscriptions`, `pro_waitlist`)
2. Env: `CRON_SECRET=<uzun rastgele değer>` (Vercel + GitHub Actions secret)
3. `.github/workflows/morning-digest.yml` hafta içi 05:30 UTC'de
   `GET /api/cron/morning-digest` çağırır (`Authorization: Bearer $CRON_SECRET`).
   Elle denemek için Actions → Morning Digest → Run workflow.

İçerik `src/lib/daily-digest.ts` — paylaşım görseli (`/api/og?type=radar`) ile aynı
5 sembolü kullanır.

## Sunucu tarafı alarm kontrolü

`/api/cron/alerts` tüm kayıtlı alarmları canlı fiyat / RSI / skorla kontrol eder ve tetiklenen
alarm sahibine tek e-posta gönderir. Tarayıcıdaki AlertEngine ile aynı kurallar
(`src/lib/alert-eval.ts`) kullanılır.

- Çift e-posta yok: gönderen taraf `price_alerts.notified_at` alanını koşullu güncelleme ile
  “sahiplenir”; tarayıcı (`/api/alerts/notify`) ve cron aynı alarmı iki kez göndermez.
- Koşul ortadan kalkınca alarm yeniden kurulur (`is_triggered=false`, `notified_at=null`).
- Alarm sahibinin e-postası `price_alerts.email` alanında tutulur (eski alarmlar oturum
  açıldığında doldurulur).
- Gereken: `npm run db:push` (yeni kolonlar: `email`, `notified_at`) ve `CRON_SECRET`.
