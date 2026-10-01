# Yönetim paneli

Panel: `/admin` · Giriş: `/admin/giris`.

İlk yönetici `npm run setup:admin` ile oluşturulur. Varsayılan e-posta MongoDB'deki kulüp e-postasıdır; farklı adres için `npm run setup:admin -- yonetici@example.com` kullanın. Rastgele geçici şifre `.local-backups/admin-credentials.txt` dosyasına yazılır. Dosya Git'e dahil edilmez. İlk girişten sonra **Hesabım** bölümünden şifreyi değiştirin. Mevcut hesapların şifresi kurulum komutuyla değiştirilmez.

## Kullanım

Arayüz, kartlar yerine satır tabanlı bir çalışma masası kullanır. Üst işlem çubuğundan haber veya maç eklenebilir; bölüm listesinden yönetim alanları açılır ve haber satırına basılarak doğrudan düzenlemeye geçilir. Yayın ve oyuncu sayıları kısa bir durum satırındadır. Lacivert menü çalışma alanı, sportif yönetim ve hesap olarak grupludur; telefonda Menü düğmesiyle açılır. Mobil kayıtlar çizgilerle ayrılan kompakt satırlar halinde gösterilir. Formun altındaki sabit kaydetme alanı kaydedilmemiş değişiklikleri gösterir. Sayfa ayarlarının bölümleri doğrudan düğmelerle seçilir.

1 Ekim 2026 arayüz kontrolü: açık/koyu masaüstü görünümü, 412 px mobil form ve bölüm seçimi, 360 px kayıt listesi, arama, mobil menü ve kaydedilmemiş değişiklik uyarısının iptal edilmesi tarayıcıda doğrulandı. Kontrol edilen mobil ekranlarda yatay taşma ve tarayıcı hatası görülmedi. Geçici test hesabı temizlendi; canlı içerik kaydedilmedi.

- **Haberler:** Yeni haber yazın, görsel yükleyin, kategori ve sıralama belirleyin. “Sitede yayımla” kapalıysa haber taslaktır; liste, detay ve sitemap'te görünmez. Paragraflar boş satırla ayrılır.
- **Maçlar:** Takım, lig, sezon, tarih, hafta, saha ve skorları düzenleyin. Oynandı/hükmen durumunda iki skor da gerekir; diğer durumlarda skorlar boş olmalıdır. Yeni sezonlar site filtresine otomatik eklenir.
- **Takımlar ve oyuncular:** Takım oluşturun; kadroya oyuncu ekleyin, fotoğrafını/mevkisini güncelleyin veya kaldırın. Oyuncu sayısı otomatik hesaplanır. Takım URL kodu oluşturulduktan sonra sabittir. Maçı bulunan takım, maçlar başka takıma taşınmadan veya kaldırılmadan silinemez.
- **Teknik ekip:** İsim, görev, biyografi, fotoğraf ve sıralama.
- **Sayfa ayarları:** Ana sayfa metinleri, tüm ana sayfaların giriş başlıkları, kulüp yazısı, iletişim, galeri sırası/görselleri ve hero video/kapak adresleri. Bu panel sayfa düzeni veya CSS editörü değildir.
- **Dosyalar:** Görseller en fazla 10 MB; sunucuda doğrulanır ve en fazla 1920 px WebP'ye dönüştürülür. MP4 videolar en fazla 25 MB; web için önceden sıkıştırılmış sürüm kullanılmalıdır. Dosyalar R2'ye yüklenir. Yüklemeden sonra kaydı ayrıca kaydedin.

Değişiklikler MongoDB'ye yazılır; sitenin sonraki isteğinde görünür. Kaydet düğmesi yükleme sırasında kapalıdır. Kaydedilmemiş düzenlemeler için çıkış uyarısı vardır. Aynı kaydı iki oturum düzenlerse eski sürümle kayıt reddedilir.

## Erişim ve geri alma

### Yeni düzenleme alanları

- **Hesabım → Kullanıcılar ve yetkiler:** Yalnızca yöneticiler kullanıcı oluşturabilir, yetki değiştirebilir ve hesapları pasifleştirebilir. Editörler içerik düzenleyebilir. Kullanıcı formundan başka kayda veya bölüme geçerken kaydedilmemiş değişiklikler için uyarı gösterilir. Kaydetme sırasında başka kullanıcı seçilemez.
- **Sayfa ayarları:** Bölüm seçimi, içerik alanları ve mobil/masaüstü taslak önizlemesi birlikte gösterilir. Önizleme ayarları yayımlamaz. Yeni taslak hazırlanırken veya doğrulama başarısız olduğunda önceki görüntü açıkça etiketlenir. Önizleme kayıtları kullanıcıya özeldir ve bir saat sonra geçersiz olur.
- **Takımlar ve oyuncular:** Arama ve oyuncu seçimiyle tek oyuncu düzenlenir.
- **Rakipler:** Yaş grubu ataması ve yaş grubuna göre filtreleme desteklenir.
- **Görseller:** Yüklenen görseller merkezden kırpılarak kullanım alanına göre WebP'ye dönüştürülür: yatay 1600×900, portre 900×1200, mobil kapak 900×1600, galeri 1200×800. Harici URL'lere bu dönüşüm uygulanmaz.

Şifreler scrypt ile tuzlanarak saklanır. Rastgele oturum belirtecinin hash'i MongoDB'dedir; cookie HTTP-only, SameSite=Strict ve production'da Secure'dur. Oturumlar 8 saat geçerlidir. Giriş denemeleri veritabanında sınırlandırılır. Bütün yönetim API'leri oturum ve değişiklik isteklerinde Origin doğrulaması yapar. Açık kayıt olma endpoint'i yoktur. Production'da HTTPS kullanın; ters proxy farklı bir Host iletiyorsa `ADMIN_ORIGIN=https://siteadresiniz.com` tanımlayın.

İçerik silme işlemleri mantıksal silmedir (`_deleted`). Önceki belgeler `adminHistory` koleksiyonunda tutulur. Silinen içerikleri geri getirme şimdilik veritabanı üzerinden yapılır; panelde geri dönüş düğmesi yoktur. R2 dosyaları içerik silinince otomatik silinmez; başka kayıtlardaki kullanımları korunur.

## Doğrulama

1 Ekim 2026 ek kontrolü: Önizleme API'si boş veya hatalı gövdeleri 400 yanıtıyla reddeder. Bilinmeyen sayfa adları ana sayfa taslağını açar; oturumu olmayan kullanıcı giriş sayfasına yönlendirilir. Bu durumlar doğrulama betiğine eklendi ve yerel üretim sunucusunda geçti. Üretim derlemesi ve lint kontrolleri başarılı.

Yeni alanlar için yerel üretim sunucusunu başlatın; PowerShell'de `$env:VERIFY_BASE='http://127.0.0.1:3005'` ardından `npm run verify:admin-workspace` çalıştırın. Test yapılandırılmış MongoDB'de geçici kullanıcı, oturum, rakip ve önizleme kayıtları oluşturur; mevcut içerikleri değiştirmez ve kendi kayıtlarını temizler. `-- --browser` seçeneği geçici hesabı agent-browser'a bağlayıp görsel test için açık bırakır; ardından `npm run verify:admin-workspace -- --cleanup` ile temizleyin. Test yalnızca localhost adreslerini kabul eder.

1 Ekim 2026 doğrulaması: üretim derlemesi, TypeScript ve tam lint geçti. API testlerinde kullanıcı oluşturma/güncelleme, mükerrer e-posta, rol sınırı, oturum iptali, kişinin kendini kilitlemesini önleme, Origin kontrolü, altı sayfalık taslak önizlemesi, canlı içerik ayrımı ve rakip yaş grubu kontrolleri geçti. Tarayıcıda kullanıcı taslağından çıkış uyarısı, iptal edildiğinde verinin korunması, başarısız önizlemenin eski olarak etiketlenmesi ve 412 px mobil yerleşim kontrol edildi. Üretim ortamına yayın yapılmadı.

Yerel sunucu çalışırken `node --conditions=react-server scripts/verify-admin.mjs http://127.0.0.1:3104` erişim, CSRF, haber taslak/yayın, takım/kadro, maç, personel, ayar, dosya yükleme, şifre değiştirme ve çıkış akışlarını sınar. Geçici yönetici ve içerik kayıtları oluşturur; sonunda yalnızca kendi test kayıtlarını temizler. Ayar testinde aynı içerik yeniden kaydedilir. Canlı site üzerinde çalıştırmayın.
