const legacyCardPortraitNames = new Set([
  "adil-badur",
  "adnan-asrin-calik",
  "ahmet-eren-sener",
  "akdeniz-harmandar",
  "ali-eren-tuncay",
  "aren-sogut",
  "asil-cengiz",
  "asil-murat-koc",
  "aslan-dikmen",
  "atlas-yildirim",
  "ates-bostanci",
  "ayaz-uysal",
  "barin-kaptan",
  "baris-ali-altinok",
  "batu-boce",
  "bekir-aras-ozdemir",
  "bulut-alpsoy",
  "cagan-arel-turgut",
  "cansin-toydemir",
  "cayan-biten",
  "cemil-gursoy",
  "cesur-armagan-unal",
  "cesur-kurt",
  "demir-kurt",
  "deniz-aynaci",
  "efe-hasbi",
  "ege-yasar",
  "emir-sokmen",
  "emir-turgay",
  "emirhan-alicioglu",
  "ertugrul-ozcan",
  "eymen-bulut",
  "eymen-ozcan",
  "hasan-pehlivan",
  "mete-ozturk",
  "mirac-eymen-kuscu",
  "mirac-goster",
  "muhammet-hamza-yalcin",
  "murat-asil-koc",
  "nevzat-ruzgar-unal",
  "omer-habes",
  "ruzgar-saat",
  "sarp-dolek",
  "selahattin-badur",
  "tuncer-doruk-sahin",
  "timur-itgensoy",
  "toprak-sari",
  "ulas-doruk-deniz",
  "vedat-can-yasar",
  "yaman-hammaloglu",
  "yigit-hammaloglu",
  "yigitcan-yasar",
  "yusuf-aras-yaniklar",
]);

const ageGroupLegacyPortraits = new Map([
  ["u14:enes-cura", "enes-cura-u14-v1"],
  ["u-15:enes-cura", "enes-cura-u15-v1"],
  ["u14:eyup-yalcin", "eyup-yalcin-u14-v1"],
  ["u-15:eyup-yalcin", "eyup-yalcin-u15-v1"],
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

export function legacyPlayerPortraitArt(
  name: string,
  teamSlug?: string,
): string | null {
  const normalized = normalizedPlayerName(name);
  const key = normalized === "muhamet-hamza-yalcin"
    ? "muhammet-hamza-yalcin"
    : normalized;
  const ageGroupPortrait = teamSlug
    ? ageGroupLegacyPortraits.get(`${teamSlug}:${key}`)
    : null;
  if (ageGroupPortrait)
    return `/media/academy/legacy-player-portraits/${ageGroupPortrait}.png`;
  if (!legacyCardPortraitNames.has(key)) return null;
  const version = key === "batu-boce" ? "v2" : "v1";
  const extension = key === "atlas-yildirim" ? "webp" : "png";
  return `/media/academy/legacy-player-portraits/${key}-${version}.${extension}`;
}

type PlayerImageInput = {
  name: string;
  teamSlug?: string;
  photo?: string;
  placeholder?: boolean;
  usage?: "display" | "card";
};

/**
 * Single image source for cards, roster portraits and match avatars.
 * Prepared identity-preserving portraits always win over uploaded originals.
 */
export function resolvePlayerImage({
  name,
  teamSlug,
  photo,
  placeholder = false,
  usage = "display",
}: PlayerImageInput): string | null {
  const preparedPortrait = legacyPlayerPortraitArt(name, teamSlug);
  if (preparedPortrait) return preparedPortrait;
  if (placeholder) return null;

  return usage === "display" && photo ? photo : null;
}
