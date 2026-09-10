# Fethiye Alfa Spor — mevcut site incelemesi

İnceleme tarihi: 9 Eylül 2026. Kaynak: https://www.fethiyealfaspor.com/

## Sonuç

Marka kimliği korunabilir: siyah ve antrasit zeminler, sıcak gri vurgular, Aldrich yazı tipi, kurt amblemi ve kulübe ait fotoğraflar. Büyük çalışma öncelikle bilgi mimarisi, başvuru akışı ve yönetilebilir içerik üzerinde yapılmalı. Mevcut ana sayfa, bütün kulüp arşivini bir araya getiren uzun bir vitrin gibi çalışıyor. Yeni ziyaretçinin yaş grubu, eğitim, tesis ve başvuru bilgisine ulaşması kolaylaştırılmalı.

Bu çalışma canlı sitenin herkese açık arayüzü, HTML/CSS, tarayıcı DOM'u, çalışan etkileşimler ve sitemap üzerinden yapılan dış incelemedir. Yönetim paneli, sunucu kodu ve veritabanı incelenmedi. Canlı site değiştirilmedi; iletişim formundan mesaj gönderilmedi.

## Doğrulanmış teknik yapı

- Platform: SITE123. Footer, kaynak dosyalar ve CDN adresleri bunu doğruluyor.
- Ana sayfa 16 bölüm içeriyor. 1440 × 1000 tarayıcı boyutunda belge yüksekliği 20.474 piksel ölçüldü. Bu, yaklaşık 20 ekranlık bir içerik uzunluğu; hız puanı değildir.
- Yapı yalnızca tek sayfadan ibaret değil: ana sayfa bölümleri toplarken menüler bağımsız URL'lerde ilgili bölümü açıyor. Mobil U14 ligi bağlantısı tıklanarak doğrulandı.
- Sitemap 16 URL içeriyor. Tanıtım sayfası sitemap'te var, ana menüde görünmüyor.
- Tarayıcıda jQuery 1.11.2 ve Bootstrap 3.3.2 sürümleri görüldü. Font Awesome 4.7 CSS bağlantısı mevcut. Bunlar mevcut ön yüzün bileşenleri; buradan sunucu altyapısı veya belirli bir güvenlik açığı sonucu çıkarılamaz.
- Görsellerin büyük kısmı CSS arka planı olarak sunuluyor. Yalnızca img etiketlerini saymak varlık sayısını veya görsel erişilebilirliğini doğru göstermez.
- Robots ve sitemap erişilebilir. Ana sayfada açıklama, canonical bağlantı ve Open Graph/Twitter metaverileri bulunuyor. Açıklama ağırlıklı olarak slogandan oluşuyor; eğitim ve yer bilgisi açısından geliştirilebilir.
- İlk masaüstü oturumunda DOMContentLoaded yaklaşık 1,36 saniye, load yaklaşık 1,71 saniye görüldü. Sonraki bölüm gezintileri sonunda 130 kaynak kaydı vardı. Bunlar tek yerel oturum gözlemleridir; mobil saha verisi, Lighthouse veya Core Web Vitals ölçümü değildir.

## Korunacak tasarım değerleri

| Değer | Kaynakta görülen kullanım |
|---|---|
| Aldrich, Arial, sans-serif | Menü, başlık ve gövde metni ailesi |
| #000000 | Siyah alanlar, üst menü |
| #1B1A1A | Koyu antrasit bölüm/kart yüzeyleri |
| #43403F | Sıcak koyu gri yüzeyler |
| #B1AEAC | Gri vurgu ve tema rengi |
| #FFFFFF | Ana metin |

Öneri: Aldrich'i koruyup başlık, menü, kısa açıklama ve uzun metin arasında boyut/ağırlık/satır aralığı hiyerarşisi kurmak. Uzun paragrafların tamamını kalın ve ortalı kullanmak yerine daha kısa satırlar ve sola hizalı gövde metni kullanmak. Başka bir fonta geçmek bu incelemenin varsayımı değil.

## İncelenen akışlar ve kanıtlar

### 1. Ana sayfa ve ilk ekran — geliştirme gerekli

Kanıt: 01-desktop-home.png, 09-mobile-home.png.

Güçlü: Belirgin logo, tutarlı koyu palet, güçlü slogan ve büyük görsel. Mobilde iki sütun tek sütuna dönüşüyor.

Sorun: İlk ekranda başvuru, deneme antrenmanı veya arama düğmesi yok. Kulübün kimlere eğitim verdiği ve Fethiye'de nerede olduğu ilk bakışta anlaşılmıyor. Mobilde slogan ve afiş ilk ekranın neredeyse tamamını kaplıyor.

Öneri: Mevcut sloganın yanında kısa bir kulüp tanımı, yaş aralığı ve belirgin bir başvuru düğmesi. Gerçek antrenman fotoğraflarıyla eğitim deneyimini görünür kılmak.

### 2. Hakkında ve tanıtım — okunabilirlik geliştirilmeli

Kanıt: 02-about.png, 21-promo.png.

Güçlü: Eğitim yaklaşımını açıklayan içerik mevcut.

Sorun: Hakkında metni çok geniş satırlara, ortalı ve yoğun kalın yazıya sahip. Noktalardan sonra eksik boşluklar var. Tanıtım afişinin alt kısmı masaüstü görüntüsünde kırpılıyor; afiş içindeki açıklamalar seçilebilir HTML metni değil.

Öneri: Eğitim yaklaşımını 3–4 kısa başlık altında sunmak; önemli metni görselin dışına taşımak. Tanıtım içeriğini kulüp/eğitim sayfasıyla ilişkilendirmek.

### 3. Ekiplerimiz — içerik ve görsel düzenleme gerekli

Kanıt: 03-teams.png.

Güçlü: Altı takım kartı yaş gruplarını hızlı taratıyor; gerçek takım fotoğrafları mevcut.

Sorun: Kartlarda 25/26 sezonu, kulüp tanıtımında 2026/2027 sezonu var. Bunlar arşiv olarak etiketlenmediği için güncellik belirsiz. U13 kartının görsel alanı alınan görüntüde boş; diğer takım fotoğraflarında kırpma tutarlılığı zayıf.

Öneri: Aktif sezon ve arşiv seçimini açık hale getirmek; takım kartlarını ilgili kadro, antrenör ve fikstürle birleştirmek. Görsel boşluğu içerik kaynağında doğrulanmalı; tek ekran görüntüsünden dosyanın bozuk olduğu sonucuna varılmadı.

### 4. Duyurular ve kategori filtresi — filtre çalışıyor, sunum geliştirilmeli

Kanıt: 04-news.png, 23-news-filter.png.

U9 filtresi tıklandığında içerik değişti; kategori etkileşimi çalışıyor. İlk görünüm bütün duyuru arşivi değildir.

Sorun: Duyuru kartlarında değerlendirme izlenimi veren beş yıldız var. Uzun metinler ve küçük görseller haberin ana bilgisini geri plana atıyor. 2026/2027 hazırlık duyurularında 20/08/2027 tarihi ve geçmiş zamanlı anlatım birlikte bulunuyor; 19/08/2026 tarihli başka kayıtla birlikte editoryal doğrulama gerekiyor. Doğru tarihi varsayarak değiştirmemek gerekir.

Öneri: Başlık, yayın/etkinlik tarihi, yaş grubu, kısa özet ve görseli ayrı alanlarda yönetmek; yıldızları kaldırmak; oyuncu alımı duyurusunu başvuru sayfasına bağlamak.

### 5. Teknik ekip — güven veren içerik eksik

Kanıt: 05-staff.png.

Dört antrenörün adı ve görevi var. Ancak aynı yüzü görünmeyen takım elbiseli fotoğraf tekrarlanıyor; açıklamalar üç nokta olarak duruyor.

Öneri: Gerçek portreler, doğrulanmış kısa özgeçmiş, uzmanlık ve çalıştırdığı yaş grupları. Kulüp tanıtımındaki deneyim iddiaları içerik sahibi tarafından teyit edilmeli; bu incelemede bağımsız doğrulanmadı.

### 6. U10–U14/U15 kadroları ve oyuncu seçimi — çalışıyor, yapı ağır

Kanıt: 06-roster.png, 14-u11.png, 15-u12.png, 16-u13.png, 17-u14-u15.png, 22-player-selection.png.

Beş yaş grubu incelendi. U10 listesinde ikinci oyuncuya tıklanınca büyük portre ve seçili satır değişti. Kaynakta tekrar görünen isimlerin bir bölümü liste ve büyük portre bileşeninden kaynaklanıyor; bunları doğrudan yinelenen veri hatası saymamak gerekir.

Sorun: Beş uzun kadro ana sayfayı büyütüyor. Portrelerin ışık, kadraj ve arka planları farklı; bazı yerlerde temsili fotoğraf kullanılıyor. Yazım ve mevki adlarında biçim farklılıkları var.

Öneri: Ana sayfada takım özeti; takım sayfasında kadro. Tek oyuncu kaydını sezon ve takım ilişkileriyle kullanmak. Aynı sporcunun farklı yaş gruplarında bulunması otomatik olarak hata kabul edilmemeli. Tıklanabilir satırların klavye ve ekran okuyucu davranışı ayrıca test edilmeli.

### 7. U11–U14 ligleri — yüksek öncelikli okunabilirlik sorunu

Kanıt: 07-league.png, 11-mobile-league.png, 18-league-u13.png, 19-league-u12.png, 20-league-u11.png.

Dört ligde de sonuçlar görsel içinde. U14 ve U12 görselleri eğik sunuluyor; bazı görsellerde ilk/son satırlar kırpılmış görünüyor. U14 mobil görünümünde yazılar çok küçük. DOM'da karşılaşmaları temsil eden tablo veya bağlantı yok; yalnızca bölüm başlığı bulunuyor.

Öneri: Takım ve sezona göre filtrelenen HTML maç listesi. Mobilde tarih, rakip, skor ve saha bilgisi okunabilir kartlara dönüşmeli. Skor ve maç durumu ayrı alanlar olmalı; görselden veri aktarımı yapılırsa kulüp kayıtlarıyla doğrulanmalı.

### 8. İletişim ve form — erişilebilir, başvuru için yetersiz

Kanıt: 08-contact.png, 12-mobile-contact.png, 13-mobile-form.png.

Güçlü: Telefon tel: ve e-posta mailto: bağlantıları var. İletişim sayfası açılıyor; form mobilde tek sütuna dönüşüyor. 390 piksel genişlikte incelenen iletişim ve lig sayfalarında yatay belge taşması ölçülmedi.

Sorun: Adres yalnızca ilçe/il düzeyinde; harita belirli antrenman tesisini göstermiyor. Formda kalıcı label veya aria-label bulunmuyor, placeholder kullanılıyor. Telefon ve e-posta alanları type=text. Mobilde iletişim saatleri çok satıra bölünüyor; forma gelmeden uzun bir harita/bilgi alanı geçiliyor.

Öneri: Açık tesis adresi ve yol tarifi; sabit alan etiketleri; uygun e-posta/telefon alan türleri. Oyuncu başvurusu için velinin iletişim bilgisi, doğum yılı, ilgili program ve uygun iletişim saati gibi karar verilen asgari alanlarla ayrı akış. Başvurunun kime ulaşacağı ve kullanıcıya nasıl teyit verileceği netleştirilmeli.

Sınır: Form gönderilmedi; teslimat, spam koruması, başarı/hata ekranı ve e-posta ulaşması test edilmedi.

### 9. Mobil menü — çalışıyor, sadeleştirme gerekli

Kanıt: 10-mobile-menu.png, 11-mobile-league.png.

Menü açıldı; U14 ligi bağlantısı doğru alt sayfaya götürdü. 15 bağlantı tek listede, İletişim en sonda. Menü/paylaşım kontrolleri erişilebilirlik ağacında isimsiz düğmeler olarak görünüyor.

Öneri: Kulüp, Takımlar, Maçlar, Haberler, İletişim şeklinde gruplama ve görünür başvuru eylemi. Kontrol adları, odak sırası, Escape ile kapanma ve odak geri dönüşü ayrıca doğrulanmalı.

### 10. URL, içerik ve teknik envanter — çıkarıldı, geçişte korunmalı

Kanıt: source/sitemap.xml.txt, source/robots.txt.txt, source/dom-details.json, source/technical.json, source/sections.json, source/website.css.

Mevcut yollar: /, /hakkında, /tanıtım, /ekiplerimiz, /duyurular, /teknik-ekip, /u10, /u11, /u12-1, /u13, /u14-u15, /u14-lİgİ, /u13-lİgİ, /u12-lİgİ, /u11-lİgİ, /İletişim. Kesin URL kodlamaları için sitemap esas alınmalı.

Öneri: Her eski URL için hedefi belirleyen yönlendirme listesi; sayfaya özel başlık ve açıklamalar; anlaşılır takım/sezon URL'leri. Sitemap bulunması arama motorunda indekslenmenin veya iyi sıralamanın kanıtı değildir.

## Yenileme için önerilen temel

Ana menü: Kulüp · Takımlar · Maçlar ve Sonuçlar · Haberler · İletişim · Başvur.

Ana sayfa sırası: slogan ve kısa açıklama → başvuru → yaklaşan maç/son sonuç → eğitim yaklaşımı → yaş grupları → teknik ekip özeti → son haberler → tesis ve iletişim.

İçerik modeli: Sezon, Takım, Oyuncu, Takım–Oyuncu ilişkisi, Antrenör, Haber, Maç, Tesis, Başvuru. Bu, mevcut veritabanının çıkarılmış şeması değil; gözlenen içerikten önerilen yeni modeldir.

İlk öncelikler: Tarih/sezon tutarlılığı; fikstürlerin gerçek veriye dönüşmesi; görünür başvuru; gerçek teknik ekip içeriği; açık tesis konumu.

İkinci aşama: Menü ve sayfa ayrımı, fotoğraf standardı, uzun metin düzeni, form erişilebilirliği, içerik yönetimi ve URL geçişi.

Son doğrulama: Gerçek mobil cihazlar, klavye/ekran okuyucu, form teslimatı, görsel yükleme, yönlendirmeler ve ölçülmüş performans. Belirli bir framework/CMS seçimi için mevcut SITE123 planı, yönetim ihtiyacı, kaynaklara erişim ve bakım sorumluluğu görülmeli. Renk/font korumak mevcut altyapıya bağlı kalmayı gerektirmez.

## Dosyalar ve sınırlar

report.html: Ekran görüntülerini bulgularla birlikte gösteren yerel rapor.

screenshots/: Bu oturumda alınan 23 ekran görüntüsü. source/: Kamuya açık kaynaklar ve teknik gözlemler. Her fotoğraf/arka plan indirilmiş tam site yedeği veya çalışır klon değildir.

Tam erişilebilirlik uygunluğu, güvenlik denetimi, yönetim paneli işlevleri ve siteye ait gerçek ziyaretçi/dönüşüm verileri bu çalışmanın kapsamında doğrulanmadı. Kaynak dosyaları ile siteyi yeniden üretmek için yeterli görsel/arayüz bilgisi çıkarıldı; sunucu kodunun elde edildiği iddia edilmiyor.
