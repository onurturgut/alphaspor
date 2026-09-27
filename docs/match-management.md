# Maç yönetimi

Mevcut maç kartlarının görünümü korunur. Kadro/olay kaydı olan kartlarda açılabilir detay, organizasyon oluşturulduğunda ayrıca puan durumu gösterilir.

## Yönetim sırası

1. **Takımlar ve oyuncular:** Oyuncuları ekleyin; forma numaraları hızlı aramada kullanılır.
2. **Rakipler:** Rakip takım isimlerini bir kez kaydedin.
3. **Organizasyonlar:** Takım, sezon, lig/lig usulü turnuva/hazırlık türü, katılımcılar, maç süresi, başlangıç oyuncu sayısı, tekrar oyuna giriş ve puan kurallarını belirleyin. Kaydedip yeniden açın.
4. **Fikstür:** Başlangıç tarihi, haftalar arası gün ve rövanş tercihiyle önizleyin. Oluşturulan maçlar taslaktır. Tek sayıda katılımcıda her hafta bir takım bay geçer. Aynı organizasyonda yeniden çalıştırmak mevcut veya silinmiş eşleşmeleri değiştirmez. Tarih/saat/saha maç formundan değiştirilebilir.
5. **Maçlar:** Filtrelerle maçı bulun. Organizasyon seçildiğinde takım, sezon, tür ve katılımcılar otomatik gelir. Rakiplerin birbirleriyle oynadığı maçlar yalnızca skorla kaydedilebilir.
6. **Kadro ve olaylar:** Başlangıç/yedek seçin veya önceki maçtan kopyalayın. Oyuncular isim/forma numarasıyla aranır. Gol için dakika, skorun yazıldığı taraf, atan oyuncu ve asist seçilir. Golcü seçimi normal gollerde asist aramasına odaklanır. Rakip oyuncularını tek tek kaydetmek gerekmez. Oyuncu değişikliğinde dakika, çıkan ve giren seçilir.
7. **Kaydet/yayımla:** Olayı önce listeye ekleyin, ardından formu kaydedin. Maçı “Oynandı” olarak kaydetmek istatistikleri etkinleştirir. Maçın ve varsa organizasyonun yayımlanmış olması gerekir. Maç listesindeki “Bu sayfadaki taslakları yayımla” düğmesi filtrelenmiş sayfadaki en fazla 15 maçı yayımlar; hata olursa tamamlanan sayı bildirilir.

## Hesaplama kuralları

- Detaylı maçlarda skor sunucuda gollerden hesaplanır. Kadrosuz eski maçlar ve rakipler arası maçlarda skor elle girilir.
- Normal golde asist isteğe bağlıdır. Penaltı ve kendi kalesine golde asist verilmez; kendi kalesine gol kişisel gol sayısını artırmaz. “Golün yazıldığı takım” skordan yararlanan taraftır.
- Dakikalar başlangıç, giriş ve çıkışlardan hesaplanır. Uzatma varsa gerçek maç süresini artırın; dakika alanına örneğin `90+3` yerine `93` yazın. Aynı dakikadaki olaylar ekleme sırasıyla değerlendirilir.
- Oyuna girmeyen yedeklere maç yazılmaz. Tekrar giriş yalnızca organizasyonda izinliyse mümkündür. Hükmen/iptal maçlar oyuncu istatistiği üretmez.
- Puan tablosu yalnızca yayımlanan oynanmış/hükmen maçları içerir. Hazırlık organizasyonları puan tablosuna girmez. Sıra: puan, genel averaj, atılan gol, isim. Son isim sırası sportif bir eşitlik bozma kararı değildir; özel ikili averaj/puan silme kuralları bu sürümde yoktur.
- Tam lig tablosu için rakiplerin kendi aralarındaki sonuçları da girilmelidir.

## Veri ve geri uyumluluk

- `opponents` ve `competitions` koleksiyonları ilk kayıtla oluşur. Mevcut MongoDB bağlantısı dışında ortam değişkeni veya zorunlu veri göçü yoktur.
- `matches` belgelerine isteğe bağlı organizasyon, taraf kimlikleri, yayın durumu ve `report` eklenir. Eski kayıtlar yayınlanmış kabul edilir. Yeni maçlar panelde taslak başlar.
- Oyuncu adları maç kaydında sunucu tarafından saklanır. Bağlantılar isimle değil oyuncu kimliğiyle kurulur. Kullanılan oyuncu/rakip/takım/organizasyon silinmeden önce ilişkili kayıtlar düzenlenmelidir.
- Otomatik oyuncu kayıtları `match:<maç kimliği>` ile okuma sırasında üretilir; takım belgesine ikinci kopya yazılmaz. Düzeltme, silme veya yayından kaldırma sonraki istekte oyuncu istatistiklerine yansır. Güncellemelerde mevcut sürüm kontrolü ve geçmiş kaydı korunur.
- Eski elle girilmiş oyuncu geçmişi korunur. Aynı maçı hem oyuncu geçmişine elle hem yeni maç sistemiyle girmeyin. Önceden elle girilmiş bir maçı bu sisteme geçirirken karşılık gelen elle girilmiş kaydı kaldırın.
- Oyuncu ekranındaki sezon/tür filtrelerine organizasyon filtresi eklenir. Admin oyuncu formunda yayımlanan maçlar dahil toplamlar salt okunur gösterilir.
- Maçı olan organizasyonda katılımcılar ve oyun kuralları değiştirilemez; yeni sezon için yeni organizasyon açın. Puan kuralları ve yayın durumu düzenlenebilir.

## Kontroller

`npm run check`: ESLint, eski fikstür doğrulaması, oyuncu istatistik testleri, yeni maç yönetimi testleri ve üretim derlemesi.

`npm run verify:match-management`: Tek/çift devre ve bay, gol/asist, penaltı/kendi kalesine gol, kadro/değişiklik doğrulaması, tekrar giriş, dakika, yedekler, puan durumu, taslaklar, silme/düzeltme ve eski kayıtların korunması.
