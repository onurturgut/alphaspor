import u11 from "@/data/matches-u11.json";
import u12 from "@/data/matches-u12.json";
import u13 from "@/data/matches-u13.json";
import u14 from "@/data/matches-u14.json";
import sources from "@/data/match-sources.json";

export type Match = {
  id: string;
  teamSlug: string;
  league: string;
  season: string;
  week: number;
  date: string;
  time: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "played" | "awarded" | "unreported" | "withdrawn";
  venue: string | null;
  note: string | null;
};

export const archiveSeason = "2025/2026";
export const matches = [...u11, ...u12, ...u13, ...u14] as Match[];

export const matchSources = sources;

export function hasScore(match: Match) {
  return match.homeScore !== null && match.awayScore !== null;
}

export function isAlfa(team: string) {
  return team.toLocaleUpperCase("tr").includes("ALFA");
}

export function matchOutcome(match: Match): "win" | "draw" | "loss" | null {
  if (match.homeScore === null || match.awayScore === null) return null;
  const difference = isAlfa(match.homeTeam)
    ? match.homeScore - match.awayScore
    : match.awayScore - match.homeScore;
  return difference > 0 ? "win" : difference < 0 ? "loss" : "draw";
}

export function formatMatchDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function selectMatches(
  teamSlug: string,
  season: string,
  resultsOnly = false,
) {
  return matches
    .filter(
      (match) =>
        (!teamSlug || match.teamSlug === teamSlug) &&
        match.season === season &&
        (!resultsOnly || hasScore(match)),
    )
    .sort((a, b) => {
      const chronological = `${a.date}${a.time ?? "00:00"}`.localeCompare(
        `${b.date}${b.time ?? "00:00"}`,
      );
      return (
        (resultsOnly ? -chronological : chronological) ||
        a.league.localeCompare(b.league) ||
        a.week - b.week
      );
    });
}
