# İletişim formu e-posta kurulumu

Form `/api/contact` üzerinden SMTP ile gönderir. `.env.local` ve yayın ortamına aşağıdaki değişkenleri ekleyin; şifreleri git'e eklemeyin.

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=kulup@example.com
SMTP_PASSWORD=
SMTP_FROM="Alfa Spor <kulup@example.com>"
CONTACT_TO=kulup@example.com
```

587 STARTTLS, 465 doğrudan TLS kullanır. Gönderen adresini sağlayıcıda doğrulayın. Gmail kullanılıyorsa iki aşamalı doğrulama ve uygulama şifresi gerekir. CONTACT_TO boşsa yönetim panelindeki iletişim e-postası kullanılır. SMTP değişkenleri tarayıcıya gönderilmez.

MongoDB bağlantısı mevcut site ayarlarından kullanılır. Gönderen e-posta başına 10 dakikada 3 istek sınırı ve bot tuzağı vardır; `contact_rate_limits` kayıtları TTL ile silinir. Yayında ayrıca IP tabanlı platform hız sınırı önerilir.

Kurulum sonrası kendi kontrolünüzdeki bir adresle gerçek teslimatı ve Yanıtla adresini doğrulayın. SMTP yapılandırılmadan form başarı mesajı göstermez. Harita yönetim panelindeki kulüp adresini kullanır.
