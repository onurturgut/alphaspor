# Kurt temalı oyuncu kartı

- Referans: `C:/Users/onurt/Downloads/ChatGPT Image 24 Eyl 2026 15_33_21.png`.
- Uygulama: `src/components/academy-explorer.tsx` ve ilgili CSS modülü.
- Kullanılan görsel: `public/media/academy/wolf-card-frame-final.webp` (800 × 1200).
- Yönetim panelinden sonradan eklenen ve hazır kart görseli bulunmayan
  oyuncular için standart şablon:
  `public/media/academy/player-card-template.webp` (800 × 1200). Bu şablon,
  Yiğit Hammaloğlu kartındaki tam yüzey kar/kurt/metal çerçeve dilini kullanır;
  kartın dışında düz siyah dikdörtgen bırakmaz.
- Araç: yerleşik Image Gen; aşağıdaki iki düzenleme, ardından Sharp ile boyutlandırma ve WebP sıkıştırması.
- Fontlar: Permanent Marker ve Barlow Condensed, yerel `public/fonts` dosyaları; lisansları aynı dizinde. Kaynaklar: https://github.com/google/fonts/tree/main/apache/permanentmarker ve https://github.com/google/fonts/tree/main/ofl/barlowcondensed.

## Görsel üretim istemleri

1. Referanstaki kalkan siluetini, gümüş metal çerçeveyi, kurt gözlerini, ALFA SPOR logosunu, sisli ormanı ve alt dağ görselini koru. Oyuncuyu, forma numarasını, mevkiyi, adı ve istatistikleri kaldır. Orta alanı gerçek oyuncu fotoğrafı ve canlı metinler için koyu ve boş bırak. 2:3 dikey oranı koru. Kalkanın dışında şeffaflık kullan; dama desenini resme basma.
2. İlk çıktıda şeffaflık yerine dama deseni bulunduğu için: Yalnızca kalkan dışındaki dama desenini düz #101112 zemine dönüştür. Metal sınırı, kurt, logo, sis, orman ve dağları koru. Oyuncu veya yazı ekleme. 1024 × 1536 oranını koru.

## Dinamik içerik ve sınırlar

Oyuncu adı, soyadı, forma numarası, mevki ve takım seçili kayıttan gelir. Maç, gol, asist ve dakika mevcut sezon/maç türü filtresinin sonuçlarıdır. Eksik kayıtlar `—` olarak görünür; referanstaki örnek sayılar gerçek oyunculara aktarılmaz.

Gerçek fotoğraflar değiştirilmedi. Mevcut arka planlı fotoğraflar yumuşak kenar maskesiyle kullanılır. Referanstaki dekupe gövde, kamera açısı ve forma fotoğrafı birebir üretilmez. Kayıttaki fotoğraf şeffaf bir portreyle değiştirildiğinde aynı kart alanında kullanılabilir. Fırça yazısı referanstaki özel çizimin yerine dinamik, yerel fontla gösterilir; uzun adlar kart genişliğine göre küçülür.

## Doğrulama

- ESLint ve TypeScript geçti.
- `npm run verify:academy` geçti.
- 1440 × 1080 masaüstü, 390 × 844 ve 320 × 760 mobil kontrol edildi.
- Oyuncu seçimi, önceki/sonraki düğmeleri ve mobil Kadro → Oyuncu geçişi çalışıyor.
- Fotoğrafsız oyuncu ve uzun ad kontrol edildi; yatay taşma yok.
- Son karşılaştırma: `audit/screenshots/wolf-card-comparison-final.png`.
