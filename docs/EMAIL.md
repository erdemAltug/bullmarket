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
- Sekme kapalı sunucu cron’u sonraki iterasyon (önce 1 ay kayıt izleme)
