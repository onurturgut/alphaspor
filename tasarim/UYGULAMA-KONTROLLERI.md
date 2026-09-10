# İlk sürüm kontrolleri — 10 Eylül 2026

- `npm run lint`: başarılı.
- `npm run typecheck`: başarılı.
- `npm run build`: başarılı; 34 statik sayfa çıktısı üretildi (Next.js yardımcı sayfaları dahil).
- HTTP kontrolleri: 40 adres kontrol edildi. Normal sayfalar 200, eski adresler 308; bilinmeyen takım 404. Ayrıntılar `route-checks.json`.
- Türkçe karakterli eski Hakkında, İletişim ve U14 ligi adreslerinin yönlendirmeleri ayrıca düzeltildi ve tekrar kontrol edildi.
- Masaüstü: ana sayfa U12 kartı doğru takım sayfasına gidiyor. Oyuncuya tıklama seçimi sabitliyor. Kadro yanında saha ve büyük portre gösteriliyor.
- Mobil 390×844: Saha/Kadro sekmeleri açılıyor. Kaleci araması tek eşleşmeye indi; seçim sonrası Deniz AYNACI fotoğrafı kaleci bölgesinde göründü.
- Haberlerde U9 filtresi iki U9 haberini gösterdi.
- Maç merkezine takım/sezon/sonuçlar sorgusuyla doğrudan girildiğinde kontroller doğru açılıyor. Takım değiştirilince URL seçimi koruyor.
- İletişim formu: boş ad/e-posta/mesaj reddediliyor. Yalnız boşluk içeren ad için özel hata gösteriliyor. E-posta gönderilmedi.
- Mobil menü açıldığında arka içerik odaktan çıkarılıyor; Shift+Tab menünün son eylemine dönüyor. Escape menüyü kapatıp arka içeriği yeniden etkinleştiriyor.
- İncelenen masaüstü/mobil ana sayfa, takım, haber ve iletişim görünümlerinde yatay belge taşması yok. Tarayıcı hata kaydı boş.

Ekran görüntüleri bu klasörde. Bunlar tarayıcı emülasyon kontrolleridir; gerçek telefon, bütün tarayıcı sürümleri, ekran okuyucu ve saha performans ölçümü değildir.

Ürün sınırı: Maç verileri henüz girilmedi, form sunucu teslimatı yok, yönetim paneli yok. Görsel yer tutucuları kullanıcının istediği `g` harfidir. CSS 3D hareketleri bulunur; gerçek 3D model/WebGL sahnesi sonraki aşamadır.
