# Standart dinamik oyuncu kartı

Tüm oyuncular aynı 800 × 1200 kart şablonunu kullanır:

`public/media/academy/player-card-template-v2.webp`

Eski oyuncuya özel hazır kartlar üretim akışından çıkarılmıştır. Forma numarası,
mevki, `AKADEMİ`, ad-soyad ve `MAÇ / GOL / ASİST / DK` alanları canlı veriden
tek SVG katmanında üretilir ve Sharp ile şablona işlenir. İndirilen sonuç kalite
94 ile kodlanmış tek bir 800 × 1200 WebP dosyasıdır.

## Tipografi

- Yazı ailesi: Bion Bold.
- Bütün kart metinleri 10 derece sağa eğilir.
- Forma numarası: 122 px, gümüş gradyan ve koyu kontur.
- İsim: uzunluğa göre 42–55 px.
- Soyadı: uzunluğa göre 50–66 px.
- İstatistik etiketleri: 25 px.
- İstatistik değerleri: 52 px.
- İstatistikler dört hücrenin geometrik ve optik merkezine hizalanır.

## Oyuncu portreleri

Kartlarda kimliği, formayı, numarayı ve pozu korunan şeffaf oyuncu portreleri
`public/media/academy/legacy-player-portraits/` dizininden kullanılır. Tekil
oyuncu portresi yaş grubuna göre değişiyorsa eşleştirme `src/lib/player-card-art.ts`
içinde yapılır.

Kart üretimi arka planlı ham fotoğrafı kullanmaz. Hazırlanmış şeffaf portresi
olmayan oyuncunun kartı fotoğrafsız üretilir; placeholder kayıtları da portre
olarak basılmaz. Liste ve maç avatarlarında ise hazırlanmış portre yoksa oyuncunun
orijinal fotoğrafı gösterilebilir.

## Katman sırası

1. Standart kurt/metal/dağ şablonu ve Alfa Spor logosu.
2. Arka planı kaldırılmış oyuncu kesiti.
3. Bion Bold dinamik kimlik ve istatistik SVG'si.
4. Tek 800 × 1200 WebP çıktı.
