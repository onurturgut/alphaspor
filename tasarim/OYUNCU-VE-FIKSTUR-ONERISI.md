# Oyuncu ve fikstür tasarım önerisi

Kullanıcı talebi: Masaüstünde üç sütun; saha üzerinde mevki gösterimi, büyük oyuncu fotoğrafı, mevcut siteye benzer kadro listesi. Listede hover olduğunda sahadaki ilgili konumda öğrencinin fotoğrafı. Mobil düzen tasarımcıya bırakıldı. Fikstür ve sonuçlar için öneri isteniyor; henüz uygulama yapılmadı.

Öneri: %40 saha / %27 oyuncu / %33 liste. Takım ve sezon seçimi üstte. Bölüm içinde saha ve portre sticky; uzun liste sayfayla doğal kayar. Hover ve klavye odağı geçici önizleme; tıklama kalıcı seçim. Fare ayrılınca kalıcı seçim geri gelir. Fotoğraflar önceden yüklenir, kart boyutları değişmez. Saha zemini ayrı görsel, fotoğraf işaretçileri ve etiketler bağımsız etkileşimli katman olur.

Mobil: Üstte kompakt seçili oyuncu özeti, altında Saha/Kadro sekmeleri; kadro satırına dokununca seçim saklanır, Saha sekmesinde gösterilir. Hover bağımlılığı olmaz. Üç masaüstü sütunu dar ekrana sıkıştırılmaz.

Veri sınırı: Kaynakta çoğunlukla Kaleci/Defans/Orta Saha/Forvet var. Detaylı rol bilinmeden sağ/sol veya taktik konumu uydurulmaz. Genel mevki biliniyorsa bölge vurgusu ve o bölgeye bağlı fotoğraf gösterilir. Ayrıntılı rol antrenör tarafından girildiğinde kesin konuma geçilir. Formasyon takım/maç verisi olarak yönetilir. Örnek 4-3-3 görseli gerçek ilk 11 veya forma numarası bilgisi değildir. Küçük yaş gruplarının oyuncu sayısı ve saha düzeni ayrıca kulüpçe tanımlanır.

Fikstür önerisi: Sezon ve yaş grubu filtreleri, yaklaşan maç özeti, Fikstür/Sonuçlar sekmeleri; tarih, rakip, ev/deplasman, saha ve maç durumu. Masaüstü satır/tablo; mobil kart. Bitmiş maçta skor; programlanmış maçta saat. Ertelenen/iptal edilen maçlar açık etiket; bilinmeyen sonuç 0-0 yapılmaz. Puan durumu yalnızca tam ve doğrulanmış lig verisi varsa eklenir. Yönetim panelinde tek maç kaydı tüm ilgili yüzeylere yansır. Ekran görüntülerindeki sonuçlar aktarılırken doğrulanır.

## Konsept görsel

Dosya: saha-konsepti-433.png. Yerleşimi tartışmak için önizleme; üretim arayüzü değil.

Built-in image_gen aracı kullanıldı. Kullanıcının eklediği perspektif çim saha referans alındı.

Üretim istemi: Use case: infographic-diagram. Create a polished football formation pitch concept image for Fethiye Alfa Spor website, using the user's attached miniature grass football field as a visual reference only. Show ONE full football field in portrait orientation within a landscape 3:2 canvas, nearly overhead with gentle 3D perspective, much more overhead than reference so every tactical marker is legible. Dark charcoal #1B1A1A surrounding canvas, realistic muted deep green striped grass, crisp thin white markings, two small goals, subtle physical depth and shadow. Premium restrained sporting interface aesthetic with geometric Aldrich-like typography. Include exactly 11 white circular tactical markers arranged as an illustrative 4-3-3 attacking UP the page: bottom goalkeeper 1; back line from left to right 3,4,5,2; midfield one deeper central 6 then advanced left 8 and advanced right 10; forward line left 11, center 9, right 7. Do not use real student names or faces. Label each marker in Turkish nearby: 1 KALECİ, 3 SOL BEK, 4 STOPER, 5 STOPER, 2 SAĞ BEK, 6 ÖN LİBERO, 8 MERKEZ ORTA SAHA, 10 OFANSİF ORTA SAHA, 11 SOL KANAT, 9 SANTRFOR, 7 SAĞ KANAT. Enough spacing that all labels fit. Above pitch title 'SAHADAKİ YERİN' and small subtitle '4-3-3 · Örnek diziliş'. Bottom note 'Numaralar örnek rol gösterimidir.' This is an illustrative tactical concept, not a real club starting lineup or shirt-number assignment. No unrelated objects, no neon, no gold, no additional panels, no player photos. Keep grass field dominant and all field lines accurate. Make it visually useful as the first column concept for a three-column roster interface.
