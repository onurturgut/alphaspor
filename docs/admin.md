# Yönetim paneli

Panel: `/admin` · Giriş: `/admin/giris`.

İlk yönetici `npm run setup:admin` ile oluşturulur. Varsayılan e-posta MongoDB'deki kulüp e-postasıdır; farklı adres için `npm run setup:admin -- yonetici@example.com` kullanın. Rastgele geçici şifre `.local-backups/admin-credentials.txt` dosyasına yazılır. Dosya Git'e dahil edilmez. İlk girişten sonra **Hesabım** bölümünden şifreyi değiştirin. Mevcut hesapların şifresi kurulum komutuyla değiştirilmez.

## Kullanım

- **Haberler:** Yeni haber yazın, görsel yükleyin, kategori ve sıralama belirleyin. “Sitede yayımla” kapalıysa haber taslaktır; liste, detay ve sitemap'te görünmez. Paragraflar boş satırla ayrılır.
- **Maçlar:** Takım, lig, sezon, tarih, hafta, saha ve skorları düzenleyin. Oynandı/hükmen durumunda iki skor da gerekir; diğer durumlarda skorlar boş olmalıdır. Yeni sezonlar site filtresine otomatik eklenir.
- **Takımlar ve oyuncular:** Takım oluşturun; kadroya oyuncu ekleyin, fotoğrafını/mevkisini güncelleyin veya kaldırın. Oyuncu sayısı otomatik hesaplanır. Takım URL kodu oluşturulduktan sonra sabittir. Maçı bulunan takım, maçlar başka takıma taşınmadan veya kaldırılmadan silinemez.
- **Teknik ekip:** İsim, görev, biyografi, fotoğraf ve sıralama.
- **Sayfa ayarları:** Ana sayfa metinleri, tüm ana sayfaların giriş başlıkları, kulüp yazısı, iletişim, galeri sırası/görselleri ve hero video/kapak adresleri. Bu panel sayfa düzeni veya CSS editörü değildir.
- **Dosyalar:** Görseller en fazla 10 MB; sunucuda doğrulanır ve en fazla 1920 px WebP'ye dönüştürülür. MP4 videolar en fazla 25 MB; web için önceden sıkıştırılmış sürüm kullanılmalıdır. Dosyalar R2'ye yüklenir. Yüklemeden sonra kaydı ayrıca kaydedin.

Değişiklikler MongoDB'ye yazılır; sitenin sonraki isteğinde görünür. Kaydet düğmesi yükleme sırasında kapalıdır. Kaydedilmemiş düzenlemeler için çıkış uyarısı vardır. Aynı kaydı iki oturum düzenlerse eski sürümle kayıt reddedilir.

## Erişim ve geri alma

Şifreler scrypt ile tuzlanarak saklanır. Rastgele oturum belirtecinin hash'i MongoDB'dedir; cookie HTTP-only, SameSite=Strict ve production'da Secure'dur. Oturumlar 8 saat geçerlidir. Giriş denemeleri veritabanında sınırlandırılır. Bütün yönetim API'leri oturum ve değişiklik isteklerinde Origin doğrulaması yapar. Açık kayıt olma endpoint'i yoktur. Production'da HTTPS kullanın; ters proxy farklı bir Host iletiyorsa `ADMIN_ORIGIN=https://siteadresiniz.com` tanımlayın.

İçerik silme işlemleri mantıksal silmedir (`_deleted`). Önceki belgeler `adminHistory` koleksiyonunda tutulur. Silinen içerikleri geri getirme şimdilik veritabanı üzerinden yapılır; panelde geri dönüş düğmesi yoktur. R2 dosyaları içerik silinince otomatik silinmez; başka kayıtlardaki kullanımları korunur.

## Doğrulama

Yerel sunucu çalışırken `node --conditions=react-server scripts/verify-admin.mjs http://127.0.0.1:3104` erişim, CSRF, haber taslak/yayın, takım/kadro, maç, personel, ayar, dosya yükleme, şifre değiştirme ve çıkış akışlarını sınar. Geçici yönetici ve içerik kayıtları oluşturur; sonunda yalnızca kendi test kayıtlarını temizler. Ayar testinde aynı içerik yeniden kaydedilir. Canlı site üzerinde çalıştırmayın.
