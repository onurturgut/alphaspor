# Fethiye Alfa Spor

Next.js App Router, React ve TypeScript ile hazırlanan kulüp sitesi. Aldrich yerel font dosyasından yüklenir; kaynak fontta bulunmayan Türkçe harfler Arial ile tamamlanır.

## Çalıştırma

Node.js 22+ önerilir. Kurulum sırasında kullanılan sürüm: Node.js 24.13.

```sh
npm ci
npm run dev
```

Yerel adres: http://127.0.0.1:3000

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

## Hazır özellikler

- Responsive ana sayfa, kulüp ve iletişim sayfaları.
- Altı takım sayfası; beş takımda kaynak siteden alınan toplam 74 kadro kaydı. U9 kadrosu kaynakta yoktur ve boş durum gösterilir.
- Masaüstünde saha, oyuncu portresi ve liste; liste seçimi/hover/klavye odağı eş zamanlı önizleme sağlar. İlk iki sütun bölüm içerisinde sabittir.
- Mobil Saha/Kadro sekmeleri, Türkçe isim/mevki araması.
- Kaynaktaki 18 haber, kategori filtreleri ve ayrı haber adresleri.
- Takım/sezon ve görünüm filtreleri URL'de korunan maç merkezi.
- U11, U12, U13 ve U14 liglerinden 64 gerçek fikstür kaydı; 60 yayımlanmış skor, hükmen sonuçlar, saha/saat bilgileri ve kaynak görselleri. Varsayılan görünüm verilerin ait olduğu 2025/2026 sezonudur.
- CSS perspective ile 3D kart eğimi ve saha derinliği; hafif giriş hareketleri, hareket azaltma desteği.
- Etiketli, doğrulamalı iletişim formu e-posta uygulamasında taslak açar. Sunucudan mesaj göndermez veya başvuru kaydetmez.
- Eski URL'ler için kalıcı yönlendirmeler, sitemap, robots ve sayfa metaverileri.

## İçerik düzenleme

`src/data/content.json` siteyi besler. Takım, oyuncu, haber, teknik ekip ve iletişim bilgileri buradadır. Teknik ekip kaydına isteğe bağlı `bio` metni eklenebilir. Kulüp sayfasında gösterilir.

`public/media/` yerel logoyu, öğrenci ve haber fotoğraflarını içerir. `placeholder: true` olan öğrenci kayıtlarında temsili fotoğraf yerine fotoğraf hazırlanıyor durumu gösterilir.

Maçlar `src/data/matches-u11.json`, `matches-u12.json`, `matches-u13.json` ve `matches-u14.json` dosyalarındadır. Kaynak bilgileri `src/data/match-sources.json`, orijinal fikstür görselleri `public/media/fixtures/` içindedir. Maç sonuçları görsellerden elle okunarak aktarılmıştır; canlı skor bağlantısı yoktur. Kaynak verisinin bütünlüğünü kontrol etmek için `npm run verify:matches` çalıştırın. `prepare:content` bu maç dosyalarını değiştirmez.

Kullanıcının isteğiyle pazarlama sayfalarındaki görsel alanları `g` yer tutucusudur. Gerçek öğrenci fotoğrafları takım sayfalarında kullanılır. Saha işaretçisi genel mevki bölgesini gösterir; kesin taktik rol, ilk 11 veya forma numarası uydurulmaz.

Arşivden yeniden veri üretmek için:

```sh
npm run prepare:content
# Gerekirse eksik haber görsellerini kaynaktan indir:
node scripts/prepare-content.mjs --fetch-missing-media
```

Bu komut elle düzenlenmiş `src/data/content.json` dosyasının üzerine arşiv verisini yazar. İçerik güncellemelerinden sonra çalıştırmadan önce bu dosyayı yedekleyin.

## Sonraki içerik ve servis bağlantıları

- Yeni hero, takım kartı ve antrenör görselleri; istenen biyografiler.
- Yönetim paneli ve başvuru kaydı/e-posta teslimat servisi henüz kurulmadı. Mevcut form açıkça e-posta taslağı oluşturur.
- Kaynak fikstürde skoru bulunmayan dört maçın sonucu ve yeni sezon programı kulüpten geldiğinde eklenebilir. 2026/2027 sezonuna ait fikstür kaynakta bulunmamaktadır.
- Kaynak metinlerdeki sezon/tarih tutarsızlıkları editoryal kontrol bekler. Arşiv aynen korunmuştur.
- Tesisin açık adresi teyit edildikten sonra harita yer tutucusu gerçek tesis konumuyla değiştirilebilir.
- Bu sürümde CSS 3D efektleri vardır; WebGL/Three.js sahnesi veya gerçek 3D model henüz yoktur.

`arsiv/` yeniden kullanılabilir kaynak arşivi, `audit/` ilk inceleme, `tasarim/` tasarım notları ve tarayıcı kontrol görüntüleridir. Canlı SITE123 sitesinde değişiklik veya yayın yapılmadı.
