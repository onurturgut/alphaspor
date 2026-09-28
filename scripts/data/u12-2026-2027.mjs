// Transcribed from the user's 14 screenshots dated 28 September 2026.
// Each screenshot's main week is authoritative; "Sonraki hafta" is a duplicate.
export const competitionId = "u12-2026-2027";
export const participants = {
  club: "FETHİYE ALFA SPOR",
  "eldirek-gucuspor": "FETHİYE ELDİREKGÜCÜSPOR",
  "1925-menteseogluspor": "1925 MENTEŞEOĞLUSPOR",
  karaculhaspor: "KARAÇULHASPOR",
  "likya-spor": "LİKYA SPOR",
  "arsa-spor": "ARSA SPOR",
  camkoyspor: "ÇAMKÖYSPOR",
  "seydikemer-spor": "SEYDİKEMER SPOR",
};
const E = "eldirek-gucuspor",
  M = "1925-menteseogluspor",
  K = "karaculhaspor",
  L = "likya-spor",
  A = "arsa-spor",
  C = "camkoyspor",
  S = "seydikemer-spor",
  F = "club";
const firstLeg = [
  [
    [E, M],
    [K, L],
    [A, C],
    [F, S],
  ],
  [
    [L, A],
    [M, K],
    [C, F],
    [S, E],
  ],
  [
    [K, E],
    [A, M],
    [F, L],
    [C, S],
  ],
  [
    [L, C],
    [M, F],
    [E, A],
    [S, K],
  ],
  [
    [A, K],
    [F, E],
    [C, M],
    [S, L],
  ],
  [
    [M, L],
    [E, C],
    [K, F],
    [A, S],
  ],
  [
    [L, E],
    [F, A],
    [C, K],
    [S, M],
  ],
];
// Weeks 8–14 in the supplied images mirror weeks 1–7 in the same row order.
export const fixtureRows = [
  ...firstLeg,
  ...firstLeg.map((round) => round.map(([h, a]) => [a, h])),
].flatMap((round, index) =>
  round.map(([homeId, awayId], slot) => ({
    week: index + 1,
    homeId,
    awayId,
    date: index === 0 ? "2026-10-24" : "",
    time: index === 0 ? "15:00" : null,
    venue: homeId === S ? "SEYDİKEMER" : null,
    order: index * 4 + slot,
  })),
);
