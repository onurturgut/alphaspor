# Maç yönetimi

## U12 2026/2027 fikstürü

Kullanıcının 28 Eylül 2026 tarihli 14 ekran görüntüsündeki tam fikstür:
8 takım, 14 hafta, 56 maç. Kaynak aktarımı `scripts/data/u12-2026-2027.mjs`
dosyasındadır. Her hafta 4 maç, her ikili için bir iç saha ve bir deplasman maçı vardır.
`node --conditions=react-server scripts/import-u12-full-fixtures.mjs` salt okunur
önizleme yapar; `--apply` eklenirse tek MongoDB işlemiyle aktarır. Eski 14 Alfa
maçının kimlikleri, skorları, raporları ve yayın ayarları korunur; 42 rakip maçı
eklenir. Geçmiş kayıtları `adminHistory` içinde saklanır. Aynı aktarım yeniden
çalıştırıldığında kayıt çoğalmaz ve elle girilmiş tarih/saat/saha korunur.

Panelde Organizasyonlar → U12 Ligi
ve Maçlar → U12 / 2026/2027 üzerinden düzenlenebilir. Kullanıcının isteğiyle puan
tablosu açıktır: galibiyet 3, beraberlik 1, mağlubiyet 0 puandır. Tam tablo için
rakiplerin kendi aralarındaki maç sonuçları da girilmelidir. İlk haftanın dört maçı
24.10.2026 saat 15:00; 2–14. haftaların tarih ve saatleri henüz açıklanmadığından
boştur. Seydikemer'in iç saha maçlarında görseldeki “SEYDİKEMER” yer bilgisi
kaydedilir; diğer sahalar tahmin edilmez. Oynanmamış maçlar tarihsiz kaydedilebilir; sonuç girildiğinde tarih
zorunludur. Yayınlanan tarihsiz maçlarda “Tarih henüz açıklanmadı” gösterilir.

Görsel oyun kurallarını içermediği için maç süresi, başlangıç oyuncu sayısı ve
tekrar giriş ayarı editörün varsayılanlarıdır (90 dakika, 11 oyuncu, tekrar giriş
kapalı); resmî U12 kuralları olarak kabul edilmemelidir. İlk kadro/maç raporundan
önce panelden doğru değerler girilmelidir. Bu alanlar ilk rapora kadar değiştirilebilir.
Yayınlamak için organizasyonun ve ilgili maçların yayın seçenekleri açılır.

Sezon başlangıcı için `node --conditions=react-server scripts/start-season-2026.mjs`
çalıştırıldı: 2025/2026 sezonunun 64 maçı ve 4 kaynak kaydı geri alınabilir biçimde
aktif listeden kaldırıldı (`_deleted` ve `adminHistory`); 14 U12 maçı ve organizasyon
yayımlandı. Varsayılan sezon 2026/2027 olarak ayarlandı. Puan tablosu açık gösterilir.

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
- Puan tablosu yalnızca yayımlanan oynanmış/hükmen maçları içerir. Hazırlık organizasyonları puan tablosuna girmez. U12 için `standingsRule: tff`, `headToHeadMeetings: 2` ve 3/1/0 puan ayarlanır. Diğer mevcut organizasyonların genel averaj sıralaması korunur.
- TFF seçeneği, [Futbol Müsabaka Talimatı madde 9](https://www.tff.org/Resources/TFF/Documents/TALIMATLAR/Futbol-Musabaka-Talimati.pdf) genel kurallarını uygular. İki takım eşitse karşılıklı puan, karşılıklı averaj, genel averaj, genel atılan gol, hükmen yenilgisi olmayan takım önceliği izlenir. Üç veya daha çok takımda tek bir mini tablo hesaplanır; karşılıklı averajdan sonra mini tablodaki atılan gole bakılır. Alt gruplar için ikili averaj yeniden başlatılmaz; deplasman golü üstünlük sağlamaz.
- Eşit puanlı grupta her ikilinin beklenen sayıda karşılaşması tamamlanmamışsa genel averaj ve atılan gol ile geçici sıralama yapılır. Eşitlik bozulmuyorsa takımlar aynı sıra numarasını paylaşır; alfabetik diziliş sportif üstünlük sağlamaz. Tamamlanmış ikili/çoklu karşılaşmalara rağmen eşitlik sürerse kesin sıra için ek müsabaka gerektiği belirtilir. Özel U12 statüsü kaynak görsellerde bulunmadığından yerel bir istisna varsayılmaz. Puan silme veya ek müsabaka kararları otomatik üretilmez.
- Tam lig tablosu için rakiplerin kendi aralarındaki sonuçları da girilmelidir.

## Veri ve geri uyumluluk

- `opponents` ve `competitions` koleksiyonları ilk kayıtla oluşur. Mevcut MongoDB bağlantısı dışında ortam değişkeni veya zorunlu veri göçü yoktur.
- `matches` belgelerine isteğe bağlı organizasyon, taraf kimlikleri, yayın durumu ve `report` eklenir. Eski kayıtlar yayınlanmış kabul edilir. Yeni maçlar panelde taslak başlar.
- Oyuncu adları maç kaydında sunucu tarafından saklanır. Bağlantılar isimle değil oyuncu kimliğiyle kurulur. Kullanılan oyuncu/rakip/takım/organizasyon silinmeden önce ilişkili kayıtlar düzenlenmelidir.
- Otomatik oyuncu kayıtları `match:<maç kimliği>` ile okuma sırasında üretilir; takım belgesine ikinci kopya yazılmaz. Düzeltme, silme veya yayından kaldırma sonraki istekte oyuncu istatistiklerine yansır. Güncellemelerde mevcut sürüm kontrolü ve geçmiş kaydı korunur.
- Eski elle girilmiş oyuncu geçmişi korunur. Aynı maçı hem oyuncu geçmişine elle hem yeni maç sistemiyle girmeyin. Önceden elle girilmiş bir maçı bu sisteme geçirirken karşılık gelen elle girilmiş kaydı kaldırın.
- Oyuncu ekranındaki sezon/tür filtrelerine organizasyon filtresi eklenir. Admin oyuncu formunda yayımlanan maçlar dahil toplamlar salt okunur gösterilir.
- Maçı olan organizasyonda katılımcılar değiştirilemez; oyun kuralları ilk maç raporuna kadar düzenlenebilir. Yeni sezon için yeni organizasyon açın. Puan tablosu seçeneği, puan kuralları ve yayın durumu düzenlenebilir.

## Kontroller

`npm run check`: ESLint, eski fikstür doğrulaması, oyuncu istatistik testleri, yeni maç yönetimi testleri ve üretim derlemesi.

`npm run verify:match-management`: Tek/çift devre ve bay, gol/asist, penaltı/kendi kalesine gol, kadro/değişiklik doğrulaması, tekrar giriş, dakika, yedekler, puan durumu, taslaklar, silme/düzeltme ve eski kayıtların korunması.
