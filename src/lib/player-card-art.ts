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

const portraitNames = new Set([
  "cansin-toydemir",
  "ege-yasar",
  "enes-cura",
  "ertugrul-ozcan",
  "eyup-yalcin",
  "mirac-goster",
  "murat-asil-koc",
  "tuncer-doruk-sahin",
]);

function normalizedPlayerName(name: string) {
  return name
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim()
    .replace(/\s+/g, "-");
}

export function playerCardKey(name: string): string | null {
  const key = normalizedPlayerName(name);
  // The roster also contains the single-m spelling for the same player.
  const cardKey = key === "muhamet-hamza-yalcin" ? "muhammet-hamza-yalcin" : key;
  return cardNames.has(cardKey) ? cardKey : null;
}

export function playerCardArt(name: string): string | null {
  const cardKey = playerCardKey(name);
  if (!cardKey) return null;
  const version = cardKey === "batu-boce" ? "v2" : "v1";
  return `/media/academy/player-cards/${cardKey}-${version}.webp`;
}

export function playerPortraitArt(name: string): string | null {
  const key = normalizedPlayerName(name);
  return portraitNames.has(key)
    ? `/media/academy/player-portraits/${key}-v1.webp`
    : null;
}
