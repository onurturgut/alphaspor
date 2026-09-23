import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Eye,
  Target,
  Heart,
  Users,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { getContent } from "@/lib/content";
import styles from "./club.module.css";

export const metadata: Metadata = {
  title: "Kulübümüz",
  description:
    "Fethiye Alfa Spor’u tanıyın: vizyonumuz, misyonumuz, oyun temelli eğitim yaklaşımımız ve öğrencilerimizin gelişimine yönelik hedeflerimiz.",
};

const development = [
  [
    "01",
    "Futbolun temelleri",
    "Top kontrolü, pas, sürüş ve vuruş becerilerini oyun içinde geliştirmeyi hedefleriz. Öğrencinin yaşına ve hazır oluşuna uygun çalışmalarla sağlam bir temel oluşturmayı önemseriz.",
  ],
  [
    "02",
    "Oyun aklı ve karar verme",
    "Oyuncunun yalnızca verilen görevi uygulamasını değil, sahayı okuyabilmesini isteriz. Alanı fark etme, takım arkadaşını görme ve doğru zamanda karar verme becerilerini oyun temelli eğitimimizin merkezine koyarız.",
  ],
  [
    "03",
    "Özgüven ve sorumluluk",
    "Hata yapmayı öğrenmenin bir parçası olarak görürüz. Denemekten çekinmeyen, sorumluluk alan, takım arkadaşını destekleyen ve duygularını yönetmeyi öğrenen bireyler yetiştirmeyi amaçlarız.",
  ],
  [
    "04",
    "Bireysel ilerleme",
    "Her öğrencinin gelişim hızı farklıdır. Başarıyı yalnızca maç sonucu üzerinden değil; gösterilen çaba, öğrenilen beceriler ve zaman içinde kazanılan alışkanlıklarla birlikte değerlendiririz.",
  ],
];
const values = [
  {
    icon: TrendingUp,
    title: "Sürekli gelişim",
    text: "Dünün üzerine bir şey eklemek; sonuç kadar emeğe ve öğrenme sürecine değer vermek.",
  },
  {
    icon: Users,
    title: "Takım ruhu",
    text: "Birlikte düşünmek, sorumluluğu paylaşmak ve takım arkadaşının gelişimini desteklemek.",
  },
  {
    icon: Heart,
    title: "Futbol sevgisi",
    text: "Oyunun keyfini korumak, merakı beslemek ve sporla kalıcı bir bağ kurmak.",
  },
  {
    icon: ShieldCheck,
    title: "Saygı ve dürüstlük",
    text: "Rakibe, antrenöre ve takım arkadaşına saygı duymak; fair play anlayışını benimsemek.",
  },
];

export default async function Club() {
  const content = await getContent();
  return (
    <>
      <div className={styles.club}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>FETHİYE ALFA SPOR</p>
          <h1>Biz kimiz?</h1>
          <p>
            Futbolu öğrenirken hayata hazırlanan, birlikte gelişen bir aileyiz.
          </p>
        </header>
        <nav className={styles.navigation} aria-label="Kulübümüz bölümleri">
          <a href="#hikayemiz">Hikâyemiz</a>
          <a href="#vizyon-misyon">Vizyon & misyon</a>
          <a href="#ogrenci-gelisimi">Öğrenci gelişimi</a>
          <a href="#hedeflerimiz">Hedeflerimiz</a>
          <a href="#degerlerimiz">Değerlerimiz</a>
        </nav>

        <section
          id="hikayemiz"
          className={styles.row}
          aria-labelledby="story-title"
        >
          <figure className={styles.photo}>
            <Image
              src="/media/club/Ekran görüntüsü 2026-09-23 140620.png"
              alt="Alfa Spor öğrencileri antrenörleriyle sahada çalışıyor"
              width={847}
              height={851}
              sizes="(max-width: 700px) 45vw, 320px"
              preload
            />
            <figcaption>Gelişim, sahada atılan ilk adımla başlar.</figcaption>
          </figure>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>HİKÂYEMİZ</p>
            <h2 id="story-title">Fethiye’den geleceğe.</h2>
            {content.about
              .split(/\n+/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>
                  {paragraph.replace(/([.!?])(?=[A-ZÇĞİÖŞÜ0-9])/g, "$1 ")}
                </p>
              ))}
            <ul className={styles.highlights}>
              {[
                "2024’te Fethiye’de başlayan yolculuk",
                "Altyapı odaklı eğitim anlayışı",
                "Oyun temelli öğrenme",
                "Bireysel gelişime verilen önem",
              ].map((item) => (
                <li key={item}>
                  <Check size={16} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="vizyon-misyon"
          className={styles.section}
          aria-label="Vizyonumuz ve misyonumuz"
        >
          <div className={styles.purposeGrid}>
            <article className={styles.purpose}>
              <Eye aria-hidden="true" />
              <h2>Vizyonumuz</h2>
              <p>
                Fethiye’den başlayarak, nitelikli altyapı eğitimi ve
                yetiştirdiği bilinçli sporcularla örnek gösterilen bir gelişim
                merkezi olmak. Futbol bilgisi kadar karakteriyle de öne çıkan,
                öğrenmeye açık ve kendi potansiyelinin farkında olan nesillerin
                yetişmesine katkı sunmak.
              </p>
              <p>
                Uzun vadeli başarının temelini, çocukların sporu sevmesinde ve
                gelişimlerini sürdürebilecek alışkanlıklar kazanmasında
                görüyoruz.
              </p>
            </article>
            <article className={styles.purpose}>
              <Target aria-hidden="true" />
              <h2>Misyonumuz</h2>
              <p>
                Çocuklara futbolu oyun yoluyla öğretmek; teknik becerilerini,
                oyun anlayışlarını ve bireysel sorumluluklarını birlikte
                geliştirmek. Her öğrenciyi kendi ihtiyaçları ve gelişim süreci
                içinde ele alarak potansiyelini ortaya koymasına yardımcı olmak.
              </p>
              <p>
                Yalnızca iyi futbolcular değil; düşünen, karar verebilen,
                takımına değer katan ve sahada öğrendiklerini yaşamına
                taşıyabilen bireyler yetiştirmeyi amaçlıyoruz.
              </p>
            </article>
          </div>
        </section>

        <section
          id="ogrenci-gelisimi"
          className={`${styles.row} ${styles.reverse}`}
          aria-labelledby="development-title"
        >
          <div className={styles.copy}>
            <p className={styles.eyebrow}>EĞİTİM YAKLAŞIMIMIZ</p>
            <h2 id="development-title">
              Her öğrenci, kendine özgü bir yolculuk.
            </h2>
            <p>
              Gelişimin tek bir ölçüsü yoktur. Topla kurulan ilişki, sahada
              alınan kararlar, takım içindeki iletişim ve yeniden deneme
              cesareti bu yolculuğun parçalarıdır. Eğitim anlayışımızı,
              öğrencinin hem futbolcu hem birey olarak güçlenmesi üzerine
              kuruyoruz.
            </p>
            <p>
              Oyun temelli yaklaşımımızda öğrenci sürecin aktif bir parçasıdır:
              görür, dener, karar verir ve deneyimlerinden öğrenir. Hedefimiz
              ezberlenmiş hareketlerin ötesinde, oyunu anlayan ve değişen
              durumlara uyum sağlayabilen sporcular yetiştirmektir.
            </p>
            <p>
              Rekabeti öğrenme fırsatı olarak görür; kazanmayı da kaybetmeyi de
              saygıyla karşılamayı önemseriz. Aidiyet duygusunu, disiplin ve
              sorumlulukla birlikte beslemeyi hedefleriz.
            </p>
          </div>
          <figure className={styles.photo}>
            <Image
              src="/media/club/Ekran görüntüsü 2026-09-23 140816.png"
              alt="Alfa Spor ve Fenerbahçe genç oyuncuları sahada birlikte"
              width={801}
              height={817}
              sizes="(max-width: 700px) 45vw, 320px"
            />
            <figcaption>Her karşılaşma, yeni bir öğrenme deneyimi.</figcaption>
          </figure>
        </section>
        <section
          className={styles.development}
          aria-label="Öğrenci gelişiminin dört boyutu"
        >
          {development.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </section>

        <section
          id="hedeflerimiz"
          className={styles.section}
          aria-labelledby="goals-title"
        >
          <p className={styles.eyebrow}>BUGÜNDEN YARINA</p>
          <h2 id="goals-title">Neyi hedefliyoruz?</h2>
          <p className={styles.sectionLead}>
            Sahadaki her çalışmayı, öğrencilerimizin uzun vadeli gelişimine
            katkı sağlayan bir adım olarak görüyoruz.
          </p>
          <ol className={styles.goals}>
            <li>
              <h3>Sağlam bir futbol temeli</h3>
              <p>
                Yaşa ve gelişim düzeyine uygun bir öğrenme süreciyle teknik
                becerileri ve oyun bilgisini güçlendirmek.
              </p>
            </li>
            <li>
              <h3>Bilinçli ve karakterli sporcular</h3>
              <p>
                Disiplin, saygı, özgüven ve sorumluluk duygusunu futbol
                eğitiminin ayrılmaz bir parçası hâline getirmek.
              </p>
            </li>
            <li>
              <h3>Daha fazla çocuğa ulaşmak</h3>
              <p>
                Fethiye’de futbol sevgisini yaygınlaştırmak ve büyüyen
                altyapımızla daha fazla öğrencinin sporla tanışmasına katkı
                sunmak.
              </p>
            </li>
            <li>
              <h3>Potansiyele alan açmak</h3>
              <p>
                Öğrencilerin güçlü yönlerini geliştirmesine, yeni deneyimler
                kazanmasına ve hazır oldukları fırsatlara doğru adım atmasına
                destek olmak.
              </p>
            </li>
          </ol>
        </section>

        <section className={styles.row} aria-labelledby="progress-title">
          <figure className={styles.photo}>
            <a
              href="/media/club/Ekran görüntüsü 2026-09-23 140928.png"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cesur Ünal duyurusunu büyük görüntüle (yeni sekme)"
            >
              <Image
                src="/media/club/Ekran görüntüsü 2026-09-23 140928.png"
                alt="Cesur Ünal’ın Fenerbahçe gelişim programlarına davet duyurusu"
                width={673}
                height={835}
                sizes="(max-width: 700px) 45vw, 320px"
              />
            </a>
            <figcaption>Duyuruyu büyütmek için görsele dokunun.</figcaption>
          </figure>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>GELİŞİM YOLCULUĞUNDAN</p>
            <h2 id="progress-title">Emekten doğan yeni bir adım.</h2>
            <p>
              Fenerbahçe U9 ekibi ile oynanan müsabakanın ardından sporcumuz
              Cesur Ünal, oyun anlayışı, özgüveni ve gelişim potansiyeliyle
              Fenerbahçe’nin hafta sonu gelişim programlarına davet edildi.
            </p>
            <p>
              Bu davet, bir öğrencimizin yolculuğundaki değerli adımlardan biri.
              Bizim için her öğrencinin ilerlemesi kıymetli; kimi zaman yeni
              öğrenilen bir beceri, kimi zaman sahada alınan sorumluluk, kimi
              zaman da karşılaşılan yeni bir fırsat.
            </p>
            <p>
              Cesur’u tebrik ediyor, gelişim yolculuğunda sağlık, disiplin ve
              başarılar diliyoruz.
            </p>
          </div>
        </section>

        <section
          id="degerlerimiz"
          className={styles.section}
          aria-labelledby="values-title"
        >
          <p className={styles.eyebrow}>BİZİ BİR ARADA TUTAN</p>
          <h2 id="values-title">Değerlerimiz</h2>
          <div className={styles.values}>
            {values.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon size={22} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <aside className={styles.join}>
          <div>
            <h2>Birlikte gelişelim.</h2>
            <p>
              Eğitim yaklaşımımızı yakından tanımak ve çocuğunuz için bilgi
              almak üzere bize ulaşın.
            </p>
          </div>
          <Link href="/iletisim#basvuru" className="button">
            Bizimle iletişime geçin{" "}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </aside>
        {content.staff.length > 0 && (
          <section
            id="teknik-ekip"
            className={styles.coaches}
            aria-labelledby="club-coaches-title"
          >
            <h2 id="club-coaches-title">Eğitmenlerimiz</h2>
            <div className={styles.coachGrid}>
              {content.staff.map((person) => (
                <Link
                  className={styles.coachCard}
                  href="/#teknik-ekip"
                  key={person.name}
                >
                  {person.photo && (
                    <div className={styles.coachPhoto}>
                      <Image
                        src={person.photo}
                        alt=""
                        fill
                        sizes="(max-width: 700px) 160px, (max-width: 1200px) 23vw, 268px"
                      />
                    </div>
                  )}
                  <h3>{person.name}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
