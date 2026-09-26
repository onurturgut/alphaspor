# Takımlar ve oyuncu profilleri

## Sayfalar

- `/takimlar`: kadrosu bulunan ilk yaş grubunu açar.
- `/takimlar/[slug]`: ilgili yaş grubunu açar; mevcut haber ve maç merkezi bağlantıları korunur.
- Masaüstü: sinematik saha, oyuncu kartı ve kadro. Tablet: saha/profil yan yana, kadro altta. Mobil: Oyuncu / Saha / Kadro sekmeleri.
- Kadro seçimi, kartı ve genel mevki işaretini birlikte günceller. Saha gerçek maç dizilişini temsil etmez.

## Veri girişi

Admin → Takımlar ve oyuncular → takım düzenle → oyuncu → **Oyuncu profili ve maç istatistikleri**.

Forma numarası, tercih edilen ayak ve herkese açık kısa gelişim hedefi/güçlü yan eklenebilir. Özel antrenör veya sağlık notları için tasarlanmamıştır.

**Katıldığı maçlar** alanında oyuncuya ait tarih, rakip, sezon, maç türü, gol, asist, dakika ve ilk 11 bilgisi girilir. Kalecilerde kurtarış ve gol yemeden tamamlama alanları da bulunur. Yalnızca oyuncunun katıldığı maçlar eklenir. Sezon toplamları ayrıca elle girilmez.

Bu ilk sürümün bireysel kayıtları takım belgesi içindeki `players[].appearances` alanında saklanır; takım maç merkezi koleksiyonunu değiştirmez. Takım sonuçlarından bireysel gol/asist çıkarılmaz. Aynı oyuncu için aynı sezon/tarih/rakip/tür kaydının tekrarı engellenir. Aynı gün aynı rakiple birden fazla turnuva karşılaşması gerekiyorsa ayrı maç kimliğiyle merkezi maç bağlantısı sonraki veri modeli genişletmesi olmalıdır.

## Hesaplama

- Maç: seçilen sezon ve türdeki bireysel kayıt sayısı.
- Gol/asist/dakika: ilgili alan bütün kayıtlarda biliniyorsa toplamı.
- Gol katkısı: gol + asist; ikisinden biri bilinmiyorsa bilinmiyor.
- İlk 11: `started: true` kayıtları; eksik bilgi varsa toplam bilinmiyor.
- Gol/maç ve asist/maç: kayıtlı maç başına ortalama.
- Kaleci: kurtarış toplamı ve gol yemeden bitirilen maç sayısı.
- `null` veya eksik bilgi “—”; girilmiş `0` değeri “0” gösterilir. Hiç kayıt yoksa toplamlar “—” olur.
- Kayıtlı maç sayısı ve sezon/tür arayüzde belirtilir. Kayıtların tüm sezonu kapsadığı varsayılmaz.

Eski oyuncular ek alanlar olmadan çalışır. Veri tabanı migrasyonu ve mevcut oyuncu kayıtlarını değiştirmek gerekmez. Gerçek kayıtlara örnek istatistik yazılmamıştır.

## Doğrulama

`npm run verify:academy`: sezon/tür filtreleri, gol/asist toplamları, sıfır–bilinmeyen ayrımı, kısmi kayıtlar, kaleci istatistikleri, eski oyuncular, negatif/geçersiz değerler, tekrar kayıtlar ve yönetim şemasının JSON dönüşümü test edilir.

Üretim derlemesi ve lint ayrıca çalıştırılır. Canlı veri tabanına test oyuncusu veya istatistik eklenmez; gerçek yönetici oturumuyla canlı kayıt yazma testi bu çalışma kapsamında yapılmadı.

## Görsel üretimi

Yerleşim referansı: `public/media/club/WhatsApp Image 2026-09-23 at 16.51.29*.jpeg` ve `16.51.30.jpeg`. Referanstaki neon yeşil, sıralamalar ve örnek OVR puanları taşınmadı; sitenin siyah/gümüş teması ve gerçek oyuncu verileri kullanıldı.

Yerleşik image_gen ile iki özgün görsel üretildi; proje için WebP olarak kaydedildi:

- `public/media/academy/cinematic-pitch.webp` (1000×1500, yaklaşık 181 KB)
- `public/media/academy/player-card-frame.webp` (700 px genişlik, yaklaşık 69 KB)

Saha promptu:

> Create a production website background image asset for a Turkish youth football academy's cinematic tactical field panel. Portrait 2:3 composition, photorealistic premium 3D render, empty football pitch in a dark modern stadium at night, high elevated camera looking down lengthwise from behind the near goal, symmetrical and perfectly centered. The ENTIRE rectangular pitch and all sidelines must be visible with generous dark margins: far corners approximately x=25%/75%, y=25%; near corners x=8%/92%, y=90%. Correct football white field markings, center circle, halfway line, penalty areas, small goals at both ends. Deep natural emerald grass, subtle alternating mowing stripes, dark charcoal stands fading into black, cinematic white stadium floodlights in upper corners, atmospheric soft mist near the stands, realistic depth, sharp field. Mostly black and silver palette outside the grass. No people, no football players, no balls, no text, no numbers, no logos, no UI, no watermarks, no floating markers. This is a clean background; the website will overlay dynamic player position indicators. Save the final generated image so it can be copied into the local project.

Kart promptu:

> Create a single premium football academy collectible player card BACKGROUND FRAME as a raster asset, portrait 3:4. A FIFA Ultimate Team inspired but ORIGINAL unbranded sculpted silver and graphite shield card, symmetrical chamfered top shoulders and subtly pointed bottom, polished brushed aluminum beveled outer rim, intricate fine silver engraved accents only at the edges, black charcoal inner face with understated silver light streaks. Photorealistic 3D metal product rendering, restrained luxury sports aesthetic. Card occupies 94% of image centered on solid near black #101010 background. Keep the whole central 75% area very dark and uncluttered to overlay a REAL player portrait later. No human figure or silhouette. No text, no letters, no numbers, no badges, no logos, no watermark, no rating bars. No gold, no neon. The website will add player photo, name and academy metadata as live HTML.
