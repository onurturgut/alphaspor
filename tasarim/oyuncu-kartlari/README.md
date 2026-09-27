# Oyuncu kartları — 27 Eylül 2026

40 oyuncunun PNG kartı bu klasörde, WebP sürümleri `public/media/academy/player-cards/` altında bulunur. Fotoğrafı bulunan tüm oyuncular `teams-snapshot.json` üzerinden kontrol edildi. Bu çalışmada 16 yeni kart üretildi; önceki 13 hazır kart da uygulamaya bağlandı.

Araç: yerleşik Image Gen. Ortak referans `barin-kaptan-v1.png`; her oyuncunun kendi kaynak fotoğrafı ikinci referanstır. İstemler `generation-prompts-2026-09-27.json` dosyasında kayıtlıdır. Muhammet Hamza'nın istemi özetlenmiştir. Formada açıkça görülen numaralar kullanıldı; Sarp Dölek'in numarası görünmediği için boş değer işareti kullanıldı. İstatistikler görsellerde — olarak bırakıldı.

Fotoğraf bekleyenler: Haluk Arda Yavuz, Serdest Yıldırım, Atahan Çil, Sedat Kerem Caner, Rodi Seven Biten. Bu oyuncularda mevcut dinamik kart görünümü kullanılır.

U12 ve U13 kayıtlarındaki Muhammet/Muhamet Hamza Yalçın yazımları aynı kaynak fotoğrafına aittir ve aynı karta eşlenir.

Yeni PNG kartlarını web için hazırlamak ve isim listesini güncellemek: `node scripts/prepare-player-cards.mjs`. Mevcut WebP dosyaları korunur.

Doğrulama: TypeScript, akademi kontrolleri, kart eşlemesi ve görsellerin okunabilirliği başarılı.
