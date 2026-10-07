export const formationIds = [
  "2-3-2",
  "3-2-2",
  "3-3-1",
  "2-4-1",
  "3-1-2-1",
  "3-2-1-1",
  "2-2-2-1",
  "2-2-1-2",
  "2-1-3-1",
  "4-2-1",
  "4-1-2",
  "4-3-3",
  "4-2-3-1",
  "4-4-2",
  "4-1-4-1",
  "4-1-2-1-2",
  "4-3-1-2",
  "4-4-1-1",
  "3-4-3",
  "3-4-2-1",
  "3-5-2",
  "3-4-1-2",
  "5-3-2",
  "5-4-1",
  "5-2-2-1",
] as const;

export type FormationId = (typeof formationIds)[number];

export const formationMeta: Record<
  FormationId,
  {
    category: "Dengeli" | "Savunmacı" | "Hücumcu" | "Dar oyun" | "Kanat oyunu";
    description: string;
  }
> = {
  "2-3-2": { category: "Dengeli", description: "Dengeli üçlü orta saha" },
  "3-2-2": { category: "Dengeli", description: "Üçlü savunma, çift forvet" },
  "3-3-1": { category: "Dengeli", description: "Kontrollü tek forvet" },
  "2-4-1": { category: "Hücumcu", description: "Kalabalık orta saha" },
  "3-1-2-1": { category: "Dar oyun", description: "Ön libero ve iç oyuncular" },
  "3-2-1-1": { category: "Dar oyun", description: "İkinci forvet desteği" },
  "2-2-2-1": { category: "Hücumcu", description: "İki hücumcu orta saha" },
  "2-2-1-2": { category: "Hücumcu", description: "On numara ve çift forvet" },
  "2-1-3-1": { category: "Kanat oyunu", description: "Üçlü hücum desteği" },
  "4-2-1": { category: "Savunmacı", description: "Dörtlü savunma" },
  "4-1-2": {
    category: "Savunmacı",
    description: "Dörtlü savunma, çift forvet",
  },
  "4-3-3": { category: "Kanat oyunu", description: "Geniş hücum üçlüsü" },
  "4-2-3-1": { category: "Dengeli", description: "Çift ön libero" },
  "4-4-2": { category: "Dengeli", description: "Klasik çift forvet" },
  "4-1-4-1": { category: "Dengeli", description: "Tek ön libero" },
  "4-1-2-1-2": { category: "Dar oyun", description: "Baklava orta saha" },
  "4-3-1-2": { category: "Dar oyun", description: "On numara ve çift forvet" },
  "4-4-1-1": { category: "Dengeli", description: "İkinci forvet desteği" },
  "3-4-3": { category: "Kanat oyunu", description: "Geniş ve hücumcu" },
  "3-4-2-1": { category: "Hücumcu", description: "İki serbest hücumcu" },
  "3-5-2": { category: "Dengeli", description: "Merkez üstünlüğü" },
  "3-4-1-2": { category: "Hücumcu", description: "On numara ve çift forvet" },
  "5-3-2": { category: "Savunmacı", description: "Üç stoper, çift forvet" },
  "5-4-1": { category: "Savunmacı", description: "Derin ve kompakt" },
  "5-2-2-1": {
    category: "Savunmacı",
    description: "Beşli hat, iki oyun kurucu",
  },
};

export type FormationSlot = {
  id: string;
  label: string;
  x: number;
  y: number;
  roles: PlayerRole[];
};

export type PlayerRole =
  | "GK"
  | "CB"
  | "RB"
  | "LB"
  | "RWB"
  | "LWB"
  | "CDM"
  | "CM"
  | "CAM"
  | "RM"
  | "LM"
  | "RW"
  | "LW"
  | "ST"
  | "CF"
  | "SS";

function defaultRoles(id: string): PlayerRole[] {
  if (id === "gk") return ["GK"];
  if (id.includes("lwb")) return ["LWB", "LB", "LM"];
  if (id.includes("rwb")) return ["RWB", "RB", "RM"];
  if (id === "lb") return ["LB", "LWB", "CB"];
  if (id === "rb") return ["RB", "RWB", "CB"];
  if (id.includes("cb")) return ["CB", "CDM"];
  if (id.includes("dm")) return ["CDM", "CM", "CB"];
  if (id.includes("am")) return ["CAM", "SS", "CM"];
  if (id === "lm") return ["LM", "LW", "LWB"];
  if (id === "rm") return ["RM", "RW", "RWB"];
  if (id.includes("cm") || id === "cm") return ["CM", "CDM", "CAM"];
  if (id === "lw") return ["LW", "LM", "RW"];
  if (id === "rw") return ["RW", "RM", "LW"];
  return ["ST", "CF", "SS"];
}

const slot = (
  id: string,
  label: string,
  x: number,
  y: number,
  roles?: PlayerRole[],
): FormationSlot => ({
  id,
  label,
  x,
  y,
  roles: roles ?? defaultRoles(id),
});

export const formations: Record<FormationId, FormationSlot[]> = {
  "2-3-2": [
    slot("gk", "KL", 50, 88, ["GK"]),
    slot("lcb", "STP", 35, 70, ["CB", "LB", "LWB"]),
    slot("rcb", "STP", 65, 70, ["CB", "RB", "RWB"]),
    slot("lm", "SLO", 18, 48, ["LM", "LW", "LWB"]),
    slot("cm", "OS", 50, 52, ["CM", "CDM", "CAM"]),
    slot("rm", "SĞO", 82, 48, ["RM", "RW", "RWB"]),
    slot("lst", "F", 38, 21, ["ST", "CF", "SS"]),
    slot("rst", "F", 62, 21, ["ST", "CF", "SS"]),
  ],
  "3-2-2": [
    slot("gk", "KL", 50, 88, ["GK"]),
    slot("lb", "SLB", 20, 68, ["LB", "LWB", "CB"]),
    slot("cb", "STP", 50, 73, ["CB", "CDM"]),
    slot("rb", "SĞB", 80, 68, ["RB", "RWB", "CB"]),
    slot("lcm", "OS", 35, 48, ["CM", "CDM", "LM"]),
    slot("rcm", "OS", 65, 48, ["CM", "CDM", "RM"]),
    slot("lst", "F", 38, 21, ["ST", "CF", "SS"]),
    slot("rst", "F", 62, 21, ["ST", "CF", "SS"]),
  ],
  "3-3-1": [
    slot("gk", "KL", 50, 88, ["GK"]),
    slot("lb", "SLB", 20, 68, ["LB", "LWB", "CB"]),
    slot("cb", "STP", 50, 73, ["CB", "CDM"]),
    slot("rb", "SĞB", 80, 68, ["RB", "RWB", "CB"]),
    slot("lm", "SLO", 18, 46, ["LM", "LW", "LWB"]),
    slot("cm", "OS", 50, 51, ["CM", "CDM", "CAM"]),
    slot("rm", "SĞO", 82, 46, ["RM", "RW", "RWB"]),
    slot("st", "SNT", 50, 19, ["ST", "CF", "SS"]),
  ],
  "2-4-1": [
    slot("gk", "KL", 50, 88, ["GK"]),
    slot("lcb", "STP", 35, 70, ["CB", "LB", "LWB"]),
    slot("rcb", "STP", 65, 70, ["CB", "RB", "RWB"]),
    slot("lm", "SLO", 13, 47, ["LM", "LW", "LWB"]),
    slot("lcm", "OS", 38, 53, ["CM", "CDM"]),
    slot("rcm", "OOS", 62, 45, ["CAM", "CM", "SS"]),
    slot("rm", "SĞO", 87, 47, ["RM", "RW", "RWB"]),
    slot("st", "SNT", 50, 18, ["ST", "CF", "SS"]),
  ],
  "3-1-2-1": [
    slot("gk", "KL", 50, 88, ["GK"]),
    slot("lb", "SLB", 20, 70, ["LB", "LWB", "CB"]),
    slot("cb", "STP", 50, 74, ["CB", "CDM"]),
    slot("rb", "SĞB", 80, 70, ["RB", "RWB", "CB"]),
    slot("dm", "DOS", 50, 56, ["CDM", "CM", "CB"]),
    slot("lm", "SLO", 27, 38, ["LM", "LW", "CM"]),
    slot("rm", "SĞO", 73, 38, ["RM", "RW", "CM"]),
    slot("st", "SNT", 50, 17, ["ST", "CF", "SS"]),
  ],
  "3-2-1-1": [
    slot("gk", "KL", 50, 88, ["GK"]),
    slot("lb", "SLB", 20, 70, ["LB", "LWB", "CB"]),
    slot("cb", "STP", 50, 74, ["CB", "CDM"]),
    slot("rb", "SĞB", 80, 70, ["RB", "RWB", "CB"]),
    slot("lcm", "OS", 35, 51, ["CM", "CDM", "LM"]),
    slot("rcm", "OS", 65, 51, ["CM", "CDM", "RM"]),
    slot("ss", "İF", 50, 34, ["SS", "CAM", "CF"]),
    slot("st", "SNT", 50, 16, ["ST", "CF", "SS"]),
  ],
  "2-2-2-1": [
    slot("gk", "KL", 50, 88, ["GK"]),
    slot("lcb", "STP", 35, 71, ["CB", "LB", "LWB"]),
    slot("rcb", "STP", 65, 71, ["CB", "RB", "RWB"]),
    slot("lcm", "OS", 35, 53, ["CM", "CDM", "LM"]),
    slot("rcm", "OS", 65, 53, ["CM", "CDM", "RM"]),
    slot("lam", "OOS", 33, 35, ["CAM", "LW", "SS"]),
    slot("ram", "OOS", 67, 35, ["CAM", "RW", "SS"]),
    slot("st", "SNT", 50, 16, ["ST", "CF", "SS"]),
  ],
  "2-2-1-2": [
    slot("gk", "KL", 50, 88, ["GK"]),
    slot("lcb", "STP", 35, 71, ["CB", "LB", "LWB"]),
    slot("rcb", "STP", 65, 71, ["CB", "RB", "RWB"]),
    slot("lcm", "OS", 35, 52, ["CM", "CDM", "LM"]),
    slot("rcm", "OS", 65, 52, ["CM", "CDM", "RM"]),
    slot("am", "OOS", 50, 35, ["CAM", "SS", "CM"]),
    slot("lst", "F", 37, 17, ["ST", "CF", "SS"]),
    slot("rst", "F", 63, 17, ["ST", "CF", "SS"]),
  ],
  "2-1-3-1": [
    slot("gk", "KL", 50, 88, ["GK"]),
    slot("lcb", "STP", 35, 71, ["CB", "LB", "LWB"]),
    slot("rcb", "STP", 65, 71, ["CB", "RB", "RWB"]),
    slot("dm", "DOS", 50, 56, ["CDM", "CM", "CB"]),
    slot("lw", "SLA", 20, 35, ["LW", "LM", "CAM"]),
    slot("am", "OOS", 50, 39, ["CAM", "SS", "CM"]),
    slot("rw", "SĞA", 80, 35, ["RW", "RM", "CAM"]),
    slot("st", "SNT", 50, 16, ["ST", "CF", "SS"]),
  ],
  "4-2-1": [
    slot("gk", "KL", 50, 88, ["GK"]),
    slot("lb", "SLB", 13, 69, ["LB", "LWB", "CB"]),
    slot("lcb", "STP", 38, 74, ["CB", "CDM"]),
    slot("rcb", "STP", 62, 74, ["CB", "CDM"]),
    slot("rb", "SĞB", 87, 69, ["RB", "RWB", "CB"]),
    slot("lcm", "OS", 35, 48, ["CM", "CDM", "LM"]),
    slot("rcm", "OS", 65, 48, ["CM", "CDM", "RM"]),
    slot("st", "SNT", 50, 18, ["ST", "CF", "SS"]),
  ],
  "4-1-2": [
    slot("gk", "KL", 50, 88, ["GK"]),
    slot("lb", "SLB", 13, 69, ["LB", "LWB", "CB"]),
    slot("lcb", "STP", 38, 74, ["CB", "CDM"]),
    slot("rcb", "STP", 62, 74, ["CB", "CDM"]),
    slot("rb", "SĞB", 87, 69, ["RB", "RWB", "CB"]),
    slot("cm", "OS", 50, 49, ["CM", "CDM", "CAM"]),
    slot("lst", "F", 37, 20, ["ST", "CF", "SS"]),
    slot("rst", "F", 63, 20, ["ST", "CF", "SS"]),
  ],
  "4-3-3": [
    slot("gk", "KL", 50, 88, ["GK"]),
    slot("lb", "SLB", 15, 70),
    slot("lcb", "STP", 38, 74),
    slot("rcb", "STP", 62, 74),
    slot("rb", "SĞB", 85, 70),
    slot("lcm", "OS", 25, 49),
    slot("cm", "OS", 50, 56),
    slot("rcm", "OS", 75, 49),
    slot("lw", "SLA", 18, 25),
    slot("st", "SNT", 50, 18),
    slot("rw", "SĞA", 82, 25),
  ],
  "4-2-3-1": [
    slot("gk", "KL", 50, 88),
    slot("lb", "SLB", 15, 70),
    slot("lcb", "STP", 38, 74),
    slot("rcb", "STP", 62, 74),
    slot("rb", "SĞB", 85, 70),
    slot("ldm", "DOS", 35, 56),
    slot("rdm", "DOS", 65, 56),
    slot("lw", "SLA", 18, 34),
    slot("am", "OOS", 50, 36),
    slot("rw", "SĞA", 82, 34),
    slot("st", "SNT", 50, 16),
  ],
  "4-4-2": [
    slot("gk", "KL", 50, 88),
    slot("lb", "SLB", 15, 70),
    slot("lcb", "STP", 38, 74),
    slot("rcb", "STP", 62, 74),
    slot("rb", "SĞB", 85, 70),
    slot("lm", "SLO", 15, 48),
    slot("lcm", "OS", 39, 52),
    slot("rcm", "OS", 61, 52),
    slot("rm", "SĞO", 85, 48),
    slot("lst", "F", 38, 21),
    slot("rst", "F", 62, 21),
  ],
  "4-1-4-1": [
    slot("gk", "KL", 50, 88),
    slot("lb", "SLB", 15, 70),
    slot("lcb", "STP", 38, 74),
    slot("rcb", "STP", 62, 74),
    slot("rb", "SĞB", 85, 70),
    slot("dm", "DOS", 50, 58),
    slot("lm", "SLO", 15, 40),
    slot("lcm", "OS", 39, 45),
    slot("rcm", "OS", 61, 45),
    slot("rm", "SĞO", 85, 40),
    slot("st", "SNT", 50, 17),
  ],
  "4-1-2-1-2": [
    slot("gk", "KL", 50, 88),
    slot("lb", "SLB", 15, 70),
    slot("lcb", "STP", 38, 74),
    slot("rcb", "STP", 62, 74),
    slot("rb", "SĞB", 85, 70),
    slot("dm", "DOS", 50, 59),
    slot("lcm", "OS", 32, 47),
    slot("rcm", "OS", 68, 47),
    slot("am", "OOS", 50, 35),
    slot("lst", "F", 38, 18),
    slot("rst", "F", 62, 18),
  ],
  "4-3-1-2": [
    slot("gk", "KL", 50, 88),
    slot("lb", "SLB", 15, 70),
    slot("lcb", "STP", 38, 74),
    slot("rcb", "STP", 62, 74),
    slot("rb", "SĞB", 85, 70),
    slot("lcm", "OS", 28, 51),
    slot("cm", "OS", 50, 56),
    slot("rcm", "OS", 72, 51),
    slot("am", "OOS", 50, 36),
    slot("lst", "F", 38, 18),
    slot("rst", "F", 62, 18),
  ],
  "4-4-1-1": [
    slot("gk", "KL", 50, 88),
    slot("lb", "SLB", 15, 70),
    slot("lcb", "STP", 38, 74),
    slot("rcb", "STP", 62, 74),
    slot("rb", "SĞB", 85, 70),
    slot("lm", "SLO", 15, 47),
    slot("lcm", "OS", 39, 52),
    slot("rcm", "OS", 61, 52),
    slot("rm", "SĞO", 85, 47),
    slot("ss", "İF", 50, 33, ["SS", "CAM", "CF"]),
    slot("st", "SNT", 50, 16),
  ],
  "3-4-3": [
    slot("gk", "KL", 50, 88),
    slot("lcb", "STP", 24, 72),
    slot("cb", "STP", 50, 76),
    slot("rcb", "STP", 76, 72),
    slot("lwb", "SLK", 13, 50),
    slot("lcm", "OS", 39, 55),
    slot("rcm", "OS", 61, 55),
    slot("rwb", "SĞK", 87, 50),
    slot("lw", "SLA", 20, 25),
    slot("st", "SNT", 50, 16),
    slot("rw", "SĞA", 80, 25),
  ],
  "3-4-2-1": [
    slot("gk", "KL", 50, 88),
    slot("lcb", "STP", 24, 72),
    slot("cb", "STP", 50, 76),
    slot("rcb", "STP", 76, 72),
    slot("lwb", "SLK", 13, 50),
    slot("lcm", "OS", 39, 55),
    slot("rcm", "OS", 61, 55),
    slot("rwb", "SĞK", 87, 50),
    slot("lam", "OOS", 34, 33),
    slot("ram", "OOS", 66, 33),
    slot("st", "SNT", 50, 14),
  ],
  "3-5-2": [
    slot("gk", "KL", 50, 88),
    slot("lcb", "STP", 24, 72),
    slot("cb", "STP", 50, 76),
    slot("rcb", "STP", 76, 72),
    slot("lwb", "SLK", 12, 48),
    slot("lcm", "OS", 34, 54),
    slot("cm", "OS", 50, 43),
    slot("rcm", "OS", 66, 54),
    slot("rwb", "SĞK", 88, 48),
    slot("lst", "F", 38, 20),
    slot("rst", "F", 62, 20),
  ],
  "3-4-1-2": [
    slot("gk", "KL", 50, 88),
    slot("lcb", "STP", 24, 72),
    slot("cb", "STP", 50, 76),
    slot("rcb", "STP", 76, 72),
    slot("lwb", "SLK", 13, 51),
    slot("lcm", "OS", 39, 55),
    slot("rcm", "OS", 61, 55),
    slot("rwb", "SĞK", 87, 51),
    slot("am", "OOS", 50, 36),
    slot("lst", "F", 38, 18),
    slot("rst", "F", 62, 18),
  ],
  "5-3-2": [
    slot("gk", "KL", 50, 88),
    slot("lwb", "SLB", 10, 65),
    slot("lcb", "STP", 30, 73),
    slot("cb", "STP", 50, 76),
    slot("rcb", "STP", 70, 73),
    slot("rwb", "SĞB", 90, 65),
    slot("lcm", "OS", 28, 47),
    slot("cm", "OS", 50, 54),
    slot("rcm", "OS", 72, 47),
    slot("lst", "F", 38, 20),
    slot("rst", "F", 62, 20),
  ],
  "5-4-1": [
    slot("gk", "KL", 50, 88),
    slot("lwb", "SLB", 10, 65),
    slot("lcb", "STP", 30, 73),
    slot("cb", "STP", 50, 76),
    slot("rcb", "STP", 70, 73),
    slot("rwb", "SĞB", 90, 65),
    slot("lm", "SLO", 15, 43),
    slot("lcm", "OS", 39, 50),
    slot("rcm", "OS", 61, 50),
    slot("rm", "SĞO", 85, 43),
    slot("st", "SNT", 50, 17),
  ],
  "5-2-2-1": [
    slot("gk", "KL", 50, 88),
    slot("lwb", "SLB", 10, 65),
    slot("lcb", "STP", 30, 73),
    slot("cb", "STP", 50, 76),
    slot("rcb", "STP", 70, 73),
    slot("rwb", "SĞB", 90, 65),
    slot("lcm", "OS", 37, 52),
    slot("rcm", "OS", 63, 52),
    slot("lam", "OOS", 34, 33),
    slot("ram", "OOS", 66, 33),
    slot("st", "SNT", 50, 15),
  ],
};

export function isFormationId(value: string | undefined): value is FormationId {
  return formationIds.includes(value as FormationId);
}

export function formationSlots(value: string | undefined) {
  return formations[isFormationId(value) ? value : "4-3-3"];
}

export function formationIdsForPlayerCount(playerCount: number) {
  return formationIds.filter((id) => formations[id].length === playerCount);
}

export function defaultFormationForPlayerCount(
  playerCount: number,
): FormationId {
  return formationIdsForPlayerCount(playerCount)[0] ?? "4-3-3";
}

export function defaultStarterCountForTeam(team: string) {
  const age = team.match(/(?:^|[^a-z0-9])u-?(\d{1,2})(?:[^a-z0-9]|$)/i);
  return age && Number(age[1]) <= 12 ? 8 : 11;
}

function normalizedPosition(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i");
}

/** Convert legacy free-text Turkish position names into tactical roles. */
export function playerRoles(position: string): PlayerRole[] {
  const text = normalizedPosition(position);
  const roles = new Set<PlayerRole>();
  const has = (...terms: string[]) => terms.some((term) => text.includes(term));

  if (has("kaleci", "goalkeeper") || /\bgk\b/.test(text)) roles.add("GK");
  if (has("sag kanat bek") || /\brwb\b/.test(text)) roles.add("RWB");
  if (has("sol kanat bek") || /\blwb\b/.test(text)) roles.add("LWB");
  if (has("sag bek") || /\brb\b/.test(text)) roles.add("RB");
  if (has("sol bek") || /\blb\b/.test(text)) roles.add("LB");
  if (has("stoper", "merkez defans") || /\bcb\b/.test(text)) roles.add("CB");
  if (
    has("on libero", "defansif orta saha", "6 numara") ||
    /\bcdm\b/.test(text)
  )
    roles.add("CDM");
  if (
    has("ofansif orta saha", "oyun kurucu", "10 numara") ||
    /\bcam\b/.test(text)
  )
    roles.add("CAM");
  if (has("sag orta saha") || /\brm\b/.test(text)) roles.add("RM");
  if (has("sol orta saha") || /\blm\b/.test(text)) roles.add("LM");
  if (has("sag kanat") || /\brw\b/.test(text)) roles.add("RW");
  if (has("sol kanat") || /\blw\b/.test(text)) roles.add("LW");
  if (has("ikinci forvet") || /\bss\b/.test(text)) roles.add("SS");
  if (has("santrafor", "merkez forvet") || /\bst\b/.test(text)) roles.add("ST");
  if (/\bcf\b/.test(text)) roles.add("CF");

  if (!roles.size && has("defans", "savunma")) roles.add("CB");
  if (!roles.size && has("orta saha", "ortasaha")) roles.add("CM");
  if (!roles.size && has("kanat")) {
    roles.add("RW");
    roles.add("LW");
  }
  if (!roles.size && has("forvet", "hucum")) roles.add("ST");
  return [...roles];
}

export function positionFitScore(position: string, slot: FormationSlot) {
  const roles = playerRoles(position);
  let best = 0;
  for (const role of roles) {
    const preference = slot.roles.indexOf(role);
    if (preference >= 0) best = Math.max(best, 100 - preference * 20);
  }
  return best;
}

export function createPositionBasedLineup(
  formation: FormationId,
  players: { id: string; position: string }[],
) {
  const slots = formationSlots(formation);
  const remaining = new Set(players.map((player) => player.id));
  const assignments: { slotId: string; playerId: string }[] = [];

  const orderedSlots = [...slots].sort((a, b) => {
    const candidates = (slot: FormationSlot) =>
      players.filter((player) => positionFitScore(player.position, slot) > 0)
        .length;
    return candidates(a) - candidates(b);
  });

  for (const slot of orderedSlots) {
    const candidate = players
      .filter((player) => remaining.has(player.id))
      .map((player) => ({
        player,
        score: positionFitScore(player.position, slot),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)[0];
    if (!candidate) continue;
    assignments.push({ slotId: slot.id, playerId: candidate.player.id });
    remaining.delete(candidate.player.id);
  }

  return slots.flatMap((slot) => {
    const assignment = assignments.find((item) => item.slotId === slot.id);
    return assignment ? [assignment] : [];
  });
}

/**
 * Mobile tactical layout uses fixed, deliberately wide rows instead of scaling
 * the desktop coordinates. Nearby Y values form one line, then that line is
 * spread across the pitch according to its player count.
 *
 * Horizontal positions:
 * 1: 50 | 2: 32/68 | 3: 18/50/82 | 4: 8/36/64/92 | 5: 5/27.5/50/72.5/95
 * Vertical positions are distributed evenly from the forward line (16) to GK (88).
 */
export function mobilePitchPosition(
  slots: FormationSlot[],
  selectedSlot: FormationSlot,
) {
  const rows: FormationSlot[][] = [];
  for (const current of [...slots].sort((a, b) => a.y - b.y)) {
    const row = rows.find((items) => {
      const average =
        items.reduce((sum, item) => sum + item.y, 0) / items.length;
      return Math.abs(current.y - average) <= 10;
    });
    if (row) row.push(current);
    else rows.push([current]);
  }

  const rowIndex = rows.findIndex((row) =>
    row.some((item) => item.id === selectedSlot.id),
  );
  const row = [...rows[rowIndex]].sort((a, b) => a.x - b.x);
  const itemIndex = row.findIndex((item) => item.id === selectedSlot.id);
  const horizontalByCount: Record<number, number[]> = {
    1: [50],
    2: [32, 68],
    3: [18, 50, 82],
    4: [8, 36, 64, 92],
    5: [5, 27.5, 50, 72.5, 95],
  };
  const horizontal =
    horizontalByCount[row.length] ??
    row.map((_, index) => 5 + (index * 90) / Math.max(1, row.length - 1));
  const vertical =
    rows.length === 1 ? 50 : 16 + (rowIndex * 72) / (rows.length - 1);

  return cinematicPitchPosition(horizontal[itemIndex], vertical);
}

/**
 * Project top-down tactical coordinates onto cinematic-pitch.webp.
 *
 * Measured against the 1000 x 1500 source image, the playing-area lines are:
 * - far goal line:  (228, 473) -> (773, 473)
 * - halfway line:   (124, 700) -> (877, 700)
 * - near goal line: (  0,1148) -> (999,1148)
 *
 * The vertical transform is projective rather than linear because the camera
 * looks down the length of the field. The horizontal limits then follow the
 * two touchlines, keeping wide players inside the visible pitch at every row.
 */
export function cinematicPitchPosition(x: number, y: number) {
  const depth = Math.min(1, Math.max(0, y / 100));
  const lateral = Math.min(1, Math.max(0, x / 100));

  // Homography through y=473 (far), y=700 (halfway), and y=1148 (near).
  const imageY = (0.0734 * depth + 0.3153) / (1 - 0.4926 * depth);
  const fieldDepth = (imageY - 473 / 1500) / ((1148 - 473) / 1500);
  const leftTouchline = 228 / 1000 + (0 / 1000 - 228 / 1000) * fieldDepth;
  const rightTouchline = 773 / 1000 + (999 / 1000 - 773 / 1000) * fieldDepth;
  const imageX = leftTouchline + lateral * (rightTouchline - leftTouchline);

  return {
    left: `${imageX * 100}%`,
    top: `${imageY * 100}%`,
  };
}
