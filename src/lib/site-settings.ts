import { mediaUrl } from "./media";

export const defaultHome = {
  eyebrow: "ALFA SPOR KULÜBÜ",
  title: "BURASI",
  titleAccent: "ALFA",
  description:
    "Daha ilerisi her zaman mümkün.\nKüçük adımlar, büyük hikâyeler.",
  primaryLabel: "Takımlarımızı Keşfet",
  primaryHref: "/takimlar",
  secondaryLabel: "Hikâyemiz",
  secondaryHref: "/kulubumuz",
  aboutTitle: "Yalnızca futbol değil.",
  aboutSubtitle: "Birlikte büyümek.",
  teamsTitle: "Geleceğin Alfaları.",
  newsTitle: "Duyurular.",
  staffTitle: "Sahanın arkasındaki ekip.",
  joinTitle: "Gelecek sensin.",
  joinSubtitle: "Alfa’ya katıl.",
  joinDescription:
    "Sahaya ilk adımını atmak ve kulübümüzü tanımak için bizimle iletişime geç.",
  resultsSeason: "2025/2026",
};
export const defaultPages = {
  club: {
    title: "Bir kulüpten fazlası.",
    eyebrow: "AİDİYETLE KURULUR. GÜVENLE BÜYÜR.",
    description:
      "Fethiye’de başlayan, her oyuncumuzla büyüyen bir gelişim yolculuğu.",
  },
  teams: {
    title: "Aynı arma. Aynı heyecan.",
    eyebrow: "TAKIMLARIMIZ",
    description:
      "Her yaşta yeni bir başlangıç. Takımını seç, Alfa ailesini yakından tanı.",
  },
  news: {
    title: "Duyurular.",
    eyebrow: "KULÜPTEN, SAHADAN, BİZDEN",
    description: "Burası ALFA, Gelecek Burada Büyür!",
  },
  matches: {
    title: "Maç merkezi.",
    eyebrow: "HER MAÇ YENİ BİR HİKÂYE",
    description:
      "Takımını ve sezonunu seç. Tüm haftaları incele, sahadaki sonuçları takip et.",
  },
  contact: {
    title: "İlk adımı birlikte atalım.",
    eyebrow: "İLETİŞİM & BAŞVURU",
    description:
      "Bir sorunuz, bir hayaliniz ya da sahaya çıkmak için heyecanınız varsa sizi dinlemek isteriz.",
  },
};
export const defaultValues = [
  { title: "Oyun temelli eğitim", text: "Keşfederek, deneyerek, oynayarak." },
  { title: "Bireysel gelişim", text: "Her oyuncunun kendi yolculuğu." },
  { title: "Takım ruhu", text: "Birlikte öğrenir, birlikte büyürüz." },
];
export const defaultGallery = [
  {
    id: "club-3",
    src: mediaUrl("/media/club/club-3.jpg"),
    alt: "Alfa Spor oyuncularının sahadaki takım fotoğrafı",
    width: 1536,
    height: 2048,
  },
  {
    id: "club-1",
    src: mediaUrl("/media/club/club-1.png"),
    alt: "Alfa Spor: altyapıda gelişim yaklaşımı",
    width: 2000,
    height: 2500,
  },
  {
    id: "club-2",
    src: mediaUrl("/media/club/club-2.png"),
    alt: "Alfa Spor 2026–2027 sezonu oyuncu katılım afişi",
    width: 2000,
    height: 3556,
  },
  {
    id: "club-4",
    src: mediaUrl("/media/club/club-4.png"),
    alt: "Alfa Spor antrenörü oyuncularıyla konuşuyor",
    width: 863,
    height: 1536,
  },
  {
    id: "club-5",
    src: mediaUrl("/media/club/club-5.png"),
    alt: "Alfa Spor oyuncuları saha kenarında bir arada",
    width: 1245,
    height: 2048,
  },
];
export type PageIntros = typeof defaultPages;
