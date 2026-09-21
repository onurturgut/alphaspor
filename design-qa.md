# Teknik ekip — görsel kontrol

- Kaynak: Kullanıcının konuşmaya eklediği 1747 × 797 px referans görsel; içerik ve fotoğraflar https://www.fethiyealfaspor.com/teknik-ekip adresinden.
- Uygulama: http://127.0.0.1:3000/#teknik-ekip ve /kulubumuz#teknik-ekip.
- Masaüstü: 1747 × 900 CSS px, 1×; `audit/screenshots/team-desktop.png` ve alt kartlar için `audit/screenshots/team-desktop-cards.png`.
- Mobil: 390 × 844 CSS px, 1×; `audit/screenshots/team-mobile.png`.
- Durum: Biyografiler kapalı. Açık durum ayrıca tarayıcıda kontrol edildi.

## Görsel değerlendirme

- Tipografi: Büyük, kalın başlıklar ve küçük sarı rol etiketleri; mevcut siteden bağımsız, referansa yakın sans-serif bölüm yazı tipi.
- Yerleşim: Ortalanmış başlık, yaklaşık üçte bir genişliğinde fotoğraflı ana kart, 18 px alt boşluk ve üç sütunlu yardımcı kartlar. Mobilde tek sütun. Referanstaki bölüm düzeni korunuyor; mevcut sitenin sabit menüsü ve bölüm üst boşluğu önizlemede ayrıca görünüyor.
- Renkler: Koyu zemin, antrasit kartlar, ince gri sınırlar ve sarı vurgu.
- Fotoğraflar: Dört gerçek eğitmenin kaynak görselleri yerel PNG dosyalarından yükleniyor; yüzler kesilmiyor. Kaynak ekran görüntüsündeki farklı kulübün eğitmenleri kullanıcı talebi doğrultusunda Alfa Spor ekibiyle değiştirildi.
- İçerik: İsimler, görevler ve biyografiler kaynak sayfadan. Genel alt başlık tüm eğitmenlerin lisanslı olduğunu iddia etmiyor. Sosyal bağlantılar kişisel hesap uydurmak yerine kulübün Instagram hesabına gidiyor.

## Kontroller

- Ana sayfada bölümün önceki kardeşi `programlar`; dört kart mevcut.
- Dört fotoğrafın tarayıcıda yüklenmesi doğrulandı.
- Devamını oku / Daha az göster kontrolleri çalışıyor.
- Masaüstü ve mobilde yatay taşma yok.
- Kulübümüz sayfası aynı bileşeni ve dört kaydı gösteriyor.
- Temiz sayfa yüklemesinde JavaScript hatası yok.
- `npm run typecheck` ve `npm run lint` geçti.

## Düzeltmeler ve sınırlar

- Açık biyografide ana fotoğrafın gereksiz uzamasını önlemek için fotoğraf üst hizaya sabitlendi. Son masaüstü görüntüleri bu düzeltmeden sonra alındı.
- Referans yalnızca üst kartı ve alt fotoğrafların başlangıcını içeriyor; alt kart metinleri ve mobil düzen aynı görsel dilde tamamlandı.
- P3: Referanstaki yazı tipinin tam adı verilmediği için yakın sistem sans-serif kullanıldı; ikon mevcut Lucide kitaplığındaki kamera simgesiyle karşılandı.

final result: passed
