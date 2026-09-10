# Maç merkezi — 10 Eylül 2026

Kaynak sitedeki dört fikstürün tam boy görselleri indirildi; sayfaların aynı
görsellere işaret ettiği kontrol edildi. Görsellerin yerel kopyaları ve SHA-256
değerleri korundu. U11/U13 için bağımsız ikinci görsel okuma yapıldı; U12/U14
kayıtları da orijinal görsellerle satır satır karşılaştırıldı.

- 64 karşılaşma: U11 14, U12 18, U13 14, U14 18.
- 60 yayımlanan skor: 58 normal sonuç, 2 hükmen sonuç.
- 3 sonucu açıklanmayan karşılaşma ve 1 rakibin ligden çıkarılması kaydı.
- Dönem, maç tarihlerinden 2025/2026 olarak sınıflandırıldı.

`npm run verify:matches` tüm haftaları, benzersiz kayıtları, geçerli tarih/saatleri,
ev sahibi/deplasman bilgilerini, skor/durum tutarlılığını ve bilinen kaynak
istisnalarını doğruladı. TypeScript, ESLint ve üretim derlemesi başarılı.

Tarayıcıda `maclar-browser-check.js` ile 19 kontrol geçti: 60 sonucun beş sayfada
ve 64 fikstürün altı sayfada eksiksiz erişimi; yeni sezon ve U9 boş durumları;
filtrelerin sayfalamayı sıfırlaması; deplasman galibiyet/mağlubiyet hesabı;
gerçek 0–0 beraberliği; hükmen skorlar; skoru olmayan satırlar; kaynak bağlantıları.

Ayrıca bağlantı üzerinden U13/sonuçlar/2025–2026 filtrelerinin geri yüklenmesi,
klavyede End tuşuyla sonuç sekmesine geçiş, ana sayfanın 17 Mayıs 2026 U13
Fethiye Alfa Spor 4–0 Erdoğanlar İnşaat Dalaman Atletikspor sonucunu göstermesi
kontrol edildi. Tarayıcı hatası ve Next.js hata katmanı görülmedi.

1440×1000, 390×844 ve 320×740 ekranlarda yatay sayfa/kart taşması yok.
Dar ekranda takım/sezon kontrolleri iki satıra alındı; sezon adı kesilmiyor.
Görünüm kayıtları: `maclar-desktop.png`, `maclar-mobile.png`.

Bu aktarım bir kaynak anlık görüntüsüdür. Otomatik canlı skor entegrasyonu
yapılmadı; kaynakta bulunmayan dört skor veya 2026/2027 maçları üretilmedi.
