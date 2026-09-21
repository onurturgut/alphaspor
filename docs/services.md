# MongoDB ve Cloudflare R2

## Kurulum

1. `.env.example` dosyasını proje kökünde `.env.local` olarak kopyalayın ve değerleri doldurun. Bu dosya Git tarafından yok sayılır. Anahtarları `NEXT_PUBLIC_` ile tanımlamayın.
2. MongoDB Atlas'ta uygulamanın veritabanı için `readWrite` yetkili bir database user oluşturun. Çalıştıracağınız sunucunun IP adresini Network Access listesine ekleyin. Drivers bağlantı adresini `MONGODB_URI`, veritabanı adını `MONGODB_DB` olarak yazın. Paroladaki özel karakterleri URL-encode edin.
3. Cloudflare R2'de bucket oluşturun. Sadece bu bucket için Object Read & Write yetkili S3 erişim anahtarı oluşturup hesap kimliği, Access Key ID, Secret Access Key ve bucket adını ilgili değişkenlere yazın. Cloudflare genel API token'ı S3 anahtarı yerine kullanılamaz.
4. Görseller herkese açık olacaksa bucket'a bağlanan alan adını `R2_PUBLIC_URL` olarak yazın. Özel bucket için boş bırakın; süreli indirme bağlantısı kullanın.
5. Node.js 22.18+ veya 24+ ile `npm run verify:services` çalıştırın. Komut MongoDB ping ve R2 HeadBucket ile okuma/erişim kontrolü yapar; veri yazmaz ve yazma yetkisini doğrulamaz. Geliştirme ortamını yükler; üretim değişkenleri için `NODE_ENV=production` kullanın.
6. Ortam değişkenlerini hosting ortamına da ekleyin ve uygulamayı yeniden başlatın.

## Kodda kullanım

- `src/lib/mongodb.ts`: `getDb()` ile veritabanına erişin; `db.collection("news")` gibi koleksiyonları kullanın. Tek bağlantı havuzu paylaşılır. Her istekte bağlantıyı kapatmayın.
- `src/lib/r2.ts`: `uploadR2Image(bytes, contentType)` dosyayı yükler ve `{ key }` döndürür. Kalıcı kayıtlara bu anahtarı yazın. Özel dosyalar için `getR2DownloadUrl(key)`, herkese açık dosyalar için `getR2PublicUrl(key)` kullanın. Süreli URL'leri veritabanında kalıcı adres olarak saklamayın.
- İki modül de yalnızca Node.js sunucu ortamında kullanılabilir. API/Server Action üzerinden dosya işlemleri eklerken çağıranı yetkilendirin ve dosyanın gerçek içeriğini doğrulayın; yükleyicideki MIME kontrolü içerik analizi değildir.
- Sunucu üzerinden yüklemede CORS gerekmez. Tarayıcıdan doğrudan yükleme ayrıca yetkilendirme, imzalı URL ve bucket CORS yapılandırması gerektirir.

## MongoDB içerik aktarımı

`npm run migrate:mongodb` yerel JSON içeriğini `teams`, `news`, `staff`, `settings`, `matches` ve `matchSources` koleksiyonlarına aktarır. Oyuncular takım belgelerindeki `players` dizisinde saklanır. Kaynak kimlikleri ve görüntüleme sırası korunur. Komut tekrar çalıştırılabilir: var olan belgeleri değiştirmez veya silmez, yalnızca eksikleri ekler. Her koleksiyon için kayıt sayısını ve kaynakla eşitliğini kontrol eder; farklı mevcut belgeleri raporlar ve korur.

Sayfalar, metadata ve sitemap içerikleri MongoDB'den okunur. `src/lib/content.ts` aynı istek içindeki okumaları birleştirir; yeni isteklerde güncel veriyi okur. MongoDB erişilemezse yerel JSON'a sessizce dönülmez. JSON dosyaları aktarım kaynağı/yedek olarak korunur. Yeni kurulumda siteyi açmadan önce aktarım komutunu çalıştırın.

## R2 görsel aktarımı

`npm run migrate:r2`, `public/media` altındaki görselleri içerik hash'i içeren benzersiz R2 yollarına yükler. Mevcut nesneleri ezmez. Her dosyayı public adresinden indirip SHA-256 değerini kaynakla karşılaştırır. Tüm dosyalar doğrulanınca MongoDB'deki yerel görsel adreslerini günceller; değişen alanların önceki değerlerini Git dışında tutulan `.local-backups` klasörüne kaydeder. Eşzamanlı düzenlenen belgeleri ezmez; hata halinde komut tekrar çalıştırılabilir.

`src/data/r2-media.json` yalnızca herkese açık URL eşlemesini içerir. Logo, ana görsel ve galeri `mediaUrl()` aracılığıyla bu eşlemeyi kullanır. Next.js izin verilen görsel alan adlarını aynı dosyadan alır. Aktarım veya public alan adı değişiminden sonra uygulamayı yeniden derleyip başlatın. Yerel görseller silinmez; MongoDB ilk aktarımıyla sonradan yeni kayıt eklenirse R2 aktarımını da yeniden çalıştırın.

Yönetim paneli ve herkese açık yükleme endpoint'i eklenmemiştir.

### Görsel zaman aşımı

R2 görselleri doğrudan tarayıcıya sunulur (`images.unoptimized: true`). Böylece Next.js'in uzak görseli indirirken uyguladığı 7 saniyelik sınır ve `/_next/image` kaynaklı 500 hataları aradan çıkar. `next/image` boyut, lazy loading ve preload davranışlarını korur; otomatik yeniden boyutlandırma/format dönüşümü yapılmaz. Büyük orijinal dosyalar yavaş bağlantılarda geç açılabilir. İleride boyutlandırılmış WebP/AVIF türevleri veya bir görsel CDN'i eklenebilir.

### Hero videosu

`IMG_9535.MP4` kaynak videosu 1080×1920, 50 fps ve 30,28 saniyedir. Orijinal değiştirilmez. Web sürümleri H.264/yuv420p, 25 fps, sessiz ve MP4 faststart olarak hazırlanır. Masaüstü sürüm 1280×720: kaynak genişliğe ölçeklenip üst bölgeye ağırlık veren 16:9 kadrajla kırpılır; video bulanık dolgu veya yan panel olmadan tüm hero alanını kaplar. Mobil sürüm 540×960 dikeydir. Kapaklar videonun üçüncü saniyesinden alınır. CSS `object-fit: cover` ile farklı ekran oranlarında da boşluk bırakılmaz.

Hazırlanan `desktop.mp4`, `mobile.mp4`, `poster.jpg`, `mobile-poster.jpg` dosyaları Git dışındaki `.local-backups/hero-video` klasöründedir. `npm run publish:hero-video` bu dosyaları içerik hash'li R2 yollarına yükler; public içerik bütünlüğü ve video byte-range (206) erişimi doğrulandıktan sonra MongoDB `settings` koleksiyonundaki `club.heroVideo` alanını günceller. Önceki alanın yedeği aynı yerel klasöre kaydedilir.

Hero, MongoDB'deki `desktop`, `mobile`, `poster`, `mobilePoster` URL'lerini kullanır. Tarayıcı ilk açılışta ekran genişliğine uygun tek video kaynağını seçer. Video sessiz, satır içi ve döngülü oynar; duraklatma düğmesi vardır. Hareketi azaltma tercihinde otomatik oynatılmaz. Oynatma engellenirse kapak ve manuel oynatma düğmesi kalır; medya hatasında kapak gösterilir. Video doğrudan R2'den sunulur, Next.js görsel işleyicisinden geçmez.

Kaynaklar: [MongoDB istemcisi](https://www.mongodb.com/docs/drivers/node/current/connect/mongoclient/), [Cloudflare R2 S3 SDK](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/).
