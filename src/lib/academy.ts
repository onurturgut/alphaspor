export type Appearance = {
  id: string;
  season: string;
  date: string;
  opponent: string;
  kind: "official" | "friendly" | "tournament";
  goals: number | null;
  assists: number | null;
  minutes: number | null;
  started: boolean | null;
  saves?: number | null;
  cleanSheet?: boolean | null;
};

export type AcademyPlayer = {
  id: string;
  name: string;
  position: string;
  photo: string;
  placeholder: boolean;
  shirtNumber?: number | null;
  foot?: "right" | "left" | "both" | "";
  goal?: string;
  strength?: string;
  appearances?: Appearance[];
};

export type AcademyTeam = {
  slug: string;
  name: string;
  season: string;
  players: AcademyPlayer[];
};

export const matchKinds = {
  official: "Resmî maç",
  friendly: "Hazırlık",
  tournament: "Turnuva",
};
export const footLabels = {
  right: "Sağ",
  left: "Sol",
  both: "İki ayak",
  "": "—",
};

export function positionZone(position: string) {
  const text = position.toLocaleLowerCase("tr-TR");
  if (text.includes("kaleci"))
    return { key: "goalkeeper", label: "Kaleci", short: "KL", top: 73 };
  if (/defans|bek|stoper/.test(text))
    return { key: "defence", label: "Defans", short: "DF", top: 64 };
  if (text.includes("orta"))
    return { key: "midfield", label: "Orta saha", short: "OS", top: 48 };
  if (/forvet|santrfor|kanat/.test(text))
    return { key: "attack", label: "Forvet", short: "FV", top: 37 };
  return { key: "unknown", label: "Mevki belirtilmemiş", short: "—", top: 48 };
}

/** An absent metric is unknown, never a fabricated zero. Partial sums stay hidden. */
export function playerStats(rows: Appearance[]) {
  const sum = (key: "goals" | "assists" | "minutes" | "saves") =>
    rows.length && rows.every((row) => typeof row[key] === "number")
      ? rows.reduce((total, row) => total + (row[key] ?? 0), 0)
      : null;
  const count = (key: "started" | "cleanSheet") =>
    rows.length && rows.every((row) => typeof row[key] === "boolean")
      ? rows.filter((row) => row[key]).length
      : null;
  const goals = sum("goals"),
    assists = sum("assists");
  return {
    matches: rows.length || null,
    goals,
    assists,
    contributions: goals !== null && assists !== null ? goals + assists : null,
    minutes: sum("minutes"),
    starts: count("started"),
    saves: sum("saves"),
    cleanSheets: count("cleanSheet"),
    goalsPerMatch: goals === null ? null : goals / rows.length,
    assistsPerMatch: assists === null ? null : assists / rows.length,
  };
}

export function playerAppearances(
  player: AcademyPlayer,
  season: string,
  kind: string = "all",
) {
  return (player.appearances ?? [])
    .filter(
      (row) => row.season === season && (kind === "all" || row.kind === kind),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}
