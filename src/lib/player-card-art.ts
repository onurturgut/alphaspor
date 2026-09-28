// Finished artwork from tasarim/oyuncu-kartlari. The same player may be
// registered in multiple age groups, so match the normalized full name.
const cardNames = new Set([
  "adil-badur",
  "adnan-asrin-calik",
  "ahmet-eren-sener",
  "ali-eren-tuncay",
  "aren-sogut",
  "asil-cengiz",
  "asil-murat-koc",
  "aslan-dikmen",
  "ates-bostanci",
  "ayaz-uysal",
  "barin-kaptan",
  "baris-ali-altinok",
  "batu-boce",
  "bekir-aras-ozdemir",
  "cagan-arel-turgut",
  "cayan-biten",
  "cemil-gursoy",
  "cesur-armagan-unal",
  "cesur-kurt",
  "demir-kurt",
  "deniz-aynaci",
  "efe-hasbi",
  "emir-sokmen",
  "emir-turgay",
  "emirhan-alicioglu",
  "eymen-bulut",
  "hasan-pehlivan",
  "mete-ozturk",
  "mirac-eymen-kuscu",
  "muhammet-hamza-yalcin",
  "nevzat-ruzgar-unal",
  "ruzgar-saat",
  "sarp-dolek",
  "selahattin-badur",
  "ulas-doruk-deniz",
  "vedat-can-yasar",
  "yaman-hammaloglu",
  "yigit-hammaloglu",
  "yigitcan-yasar",
  "yusuf-aras-yaniklar",
]);

export function playerCardArt(name: string): string | null {
  const key = name
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim()
    .replace(/\s+/g, "-");
  // The roster also contains the single-m spelling for the same player.
  const cardKey = key === "muhamet-hamza-yalcin" ? "muhammet-hamza-yalcin" : key;
  const version = cardKey === "batu-boce" ? "v2" : "v1";
  return cardNames.has(cardKey)
    ? `/media/academy/player-cards/${cardKey}-${version}.webp`
    : null;
}
