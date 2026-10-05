import type { AcademyPlayer, Appearance } from "./academy";
import { formationSlots, type FormationId } from "./formations";

export type MatchEvent =
  | {
      id: string;
      type: "goal";
      minute: number;
      side: "home" | "away";
      playerId: string | null;
      assistId: string | null;
      kind: "normal" | "penalty" | "own";
    }
  | {
      id: string;
      type: "substitution";
      minute: number;
      outId: string;
      inId: string;
    };
export type MatchReport = {
  clubSide: "home" | "away";
  duration: number;
  starterCount: number;
  allowReentry: boolean;
  starters: string[];
  bench: string[];
  formation?: FormationId;
  lineup?: { slotId: string; playerId: string }[];
  events: MatchEvent[];
  playerNames?: Record<string, string>;
  playerPhotos?: Record<string, string>;
};
export type Competition = {
  _id: string;
  name: string;
  teamSlug: string;
  season: string;
  kind: "official" | "friendly" | "tournament";
  clubName: string;
  opponentIds: string[];
  duration: number;
  starterCount: number;
  allowReentry: boolean;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
  published: boolean;
  standingsEnabled?: boolean;
  standingsRule?: "general" | "tff";
  headToHeadMeetings?: number;
};
export type Opponent = { _id: string; name: string; teamSlugs?: string[] };
export type Match = {
  id: string;
  teamSlug: string;
  league: string;
  season: string;
  week: number | null;
  date: string;
  time: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "played" | "awarded" | "unreported" | "withdrawn";
  venue: string | null;
  note: string | null;
  competitionId?: string | null;
  homeId?: string | null;
  awayId?: string | null;
  kind?: "official" | "friendly" | "tournament";
  published?: boolean;
  report?: MatchReport | null;
};

export const archiveSeason = "2025/2026";

export function hasScore(match: Match) {
  return match.homeScore !== null && match.awayScore !== null;
}

export function isAlfa(team: string) {
  return team.toLocaleUpperCase("tr").includes("ALFA");
}

export function matchOutcome(match: Match): "win" | "draw" | "loss" | null {
  if (match.homeScore === null || match.awayScore === null) return null;
  const side = clubSide(match);
  if (!side) return null;
  const difference =
    side === "home"
      ? match.homeScore - match.awayScore
      : match.awayScore - match.homeScore;
  return difference > 0 ? "win" : difference < 0 ? "loss" : "draw";
}

export function clubSide(match: Match): "home" | "away" | null {
  if (match.homeId || match.awayId)
    return match.homeId === "club"
      ? "home"
      : match.awayId === "club"
        ? "away"
        : null;
  return isAlfa(match.homeTeam)
    ? "home"
    : isAlfa(match.awayTeam)
      ? "away"
      : null;
}

export function reportScore(report: MatchReport) {
  return report.events.reduce(
    (score, event) => {
      if (event.type === "goal") score[event.side]++;
      return score;
    },
    { home: 0, away: 0 },
  );
}

/** Stable ordering preserves entry order for events at the same minute. */
export function orderedEvents(report: MatchReport) {
  return [...report.events].sort((a, b) => a.minute - b.minute);
}

export function onPitch(report: MatchReport, minute = report.duration) {
  const active = new Set(report.starters);
  for (const event of orderedEvents(report)) {
    if (event.minute > minute) break;
    if (event.type === "substitution") {
      active.delete(event.outId);
      active.add(event.inId);
    }
  }
  return active;
}

/** Used by the API as well as the editor; never trust client-side totals. */
export function validateReport(
  match: Match,
  players: Pick<AcademyPlayer, "id">[],
): string[] {
  const report = match.report;
  if (!report) return [];
  const errors: string[] = [];
  if (clubSide(match) !== report.clubSide)
    errors.push(
      "Kadro yalnızca Alfa'nın oynadığı maçın doğru tarafına bağlanabilir.",
    );
  const roster = [...report.starters, ...report.bench];
  if (new Set(roster).size !== roster.length)
    errors.push("Bir oyuncu kadroda yalnızca bir kez yer alabilir.");
  if (report.lineup) {
    const availableSlots = new Set(
      formationSlots(report.formation).map((item) => item.id),
    );
    if (report.lineup.some((item) => !availableSlots.has(item.slotId)))
      errors.push("Saha dizilişinde geçersiz bir pozisyon var.");
    if (
      new Set(report.lineup.map((item) => item.slotId)).size !==
      report.lineup.length
    )
      errors.push("Bir saha pozisyonuna yalnızca bir oyuncu atanabilir.");
    if (
      new Set(report.lineup.map((item) => item.playerId)).size !==
      report.lineup.length
    )
      errors.push("Bir oyuncu sahada yalnızca bir pozisyonda olabilir.");
    const placed = new Set(report.lineup.map((item) => item.playerId));
    if (
      placed.size !== report.starters.length ||
      report.starters.some((id) => !placed.has(id))
    )
      errors.push("Saha dizilişi ile başlangıç kadrosu uyuşmuyor.");
  }
  const known = new Set(players.map((p) => p.id));
  if (roster.some((id) => !known.has(id)))
    errors.push("Kadroda bu takıma ait olmayan oyuncu var.");
  if (
    report.starters.length > report.starterCount ||
    (match.status === "played" &&
      report.starters.length !== report.starterCount)
  )
    errors.push(`Başlangıç kadrosu ${report.starterCount} oyuncu olmalı.`);
  if (new Set(report.events.map((e) => e.id)).size !== report.events.length)
    errors.push("Maç olayı kimlikleri benzersiz olmalı.");
  const active = new Set(report.starters),
    appeared = new Set(report.starters);
  for (const event of orderedEvents(report)) {
    if (event.minute > report.duration)
      errors.push("Olay dakikası maç süresini aşamaz.");
    if (event.type === "substitution") {
      if (
        !active.has(event.outId) ||
        active.has(event.inId) ||
        !roster.includes(event.inId) ||
        event.outId === event.inId
      )
        errors.push(
          `${event.minute}. dakika: oyuncu değişikliği kadroyla uyumsuz.`,
        );
      if (!report.allowReentry && appeared.has(event.inId))
        errors.push("Bu organizasyonda tekrar oyuna giriş kapalı.");
      active.delete(event.outId);
      active.add(event.inId);
      appeared.add(event.inId);
    } else {
      const clubActor =
        (event.side === report.clubSide) !== (event.kind === "own");
      if (clubActor && (!event.playerId || !active.has(event.playerId)))
        errors.push(
          `${event.minute}. dakika: golü atan oyuncu sahadaki oyunculardan seçilmeli.`,
        );
      if (!clubActor && (event.playerId || event.assistId))
        errors.push("Rakip oyuncunun golüne Alfa oyuncusu atanamaz.");
      if (
        event.assistId &&
        (!active.has(event.assistId) ||
          event.assistId === event.playerId ||
          event.kind !== "normal")
      )
        errors.push(
          "Asist farklı bir saha oyuncusuna ve yalnızca normal gole yazılabilir.",
        );
    }
  }
  if (match.status === "played") {
    const score = reportScore(report);
    if (score.home > 99 || score.away > 99)
      errors.push("Bir takımın skoru 99'u aşamaz.");
    if (score.home !== match.homeScore || score.away !== match.awayScore)
      errors.push("Skor ile kaydedilen goller uyuşmuyor.");
  }
  if (
    (match.status === "awarded" || match.status === "withdrawn") &&
    report.events.length
  )
    errors.push("Hükmen/iptal maçında oyuncu olayı tutulamaz.");
  return [...new Set(errors)];
}

export function matchAppearances(match: Match): Map<string, Appearance> {
  const result = new Map<string, Appearance>(),
    report = match.report;
  if (!report || match.status !== "played" || match.published === false)
    return result;
  const entered = new Map(report.starters.map((id) => [id, 0]));
  const ensure = (id: string) => {
    if (!result.has(id))
      result.set(id, {
        id: `match:${match.id}`,
        season: match.season,
        date: match.date,
        opponent: report.clubSide === "home" ? match.awayTeam : match.homeTeam,
        kind: match.kind ?? "official",
        goals: 0,
        assists: 0,
        minutes: 0,
        started: report.starters.includes(id),
      });
    const row = result.get(id)!;
    if (match.competitionId) {
      row.competitionId = match.competitionId;
      row.competitionName = match.league;
    }
    return row;
  };
  report.starters.forEach(ensure);
  for (const event of orderedEvents(report)) {
    if (event.type === "substitution") {
      const start = entered.get(event.outId);
      if (start !== undefined)
        ensure(event.outId).minutes! += event.minute - start;
      entered.delete(event.outId);
      entered.set(event.inId, event.minute);
      ensure(event.inId);
    } else if (event.side === report.clubSide && event.kind !== "own") {
      if (event.playerId) ensure(event.playerId).goals!++;
      if (event.assistId) ensure(event.assistId).assists!++;
    }
  }
  for (const [id, start] of entered)
    ensure(id).minutes! += report.duration - start;
  return result;
}

export function withMatchAppearances<
  T extends { slug: string; players: AcademyPlayer[] },
>(teams: T[], matches: Match[]): T[] {
  const byTeam = new Map<string, Map<string, Appearance[]>>();
  for (const match of matches) {
    if (!byTeam.has(match.teamSlug)) byTeam.set(match.teamSlug, new Map());
    const roster = byTeam.get(match.teamSlug)!;
    for (const [id, appearance] of matchAppearances(match))
      roster.set(id, [...(roster.get(id) ?? []), appearance]);
  }
  return teams.map((team) => ({
    ...team,
    players: team.players.map((player) => ({
      ...player,
      appearances: [
        ...(player.appearances ?? []).filter((a) => !a.id.startsWith("match:")),
        ...(byTeam.get(team.slug)?.get(player.id) ?? []),
      ],
    })),
  }));
}

export function standings(
  competition: Competition,
  opponents: Opponent[],
  matches: Match[],
) {
  if (competition.standingsEnabled === false || competition.kind === "friendly")
    return [];
  const entries = [
    { _id: "club", name: competition.clubName },
    ...opponents.filter((o) => competition.opponentIds.includes(o._id)),
  ];
  const rows = new Map(
    entries.map((t) => [
      t._id,
      {
        id: t._id,
        name: t.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        scored: 0,
        conceded: 0,
        difference: 0,
        points: 0,
        awardedLoss: false,
        rank: 0,
        tied: false,
        provisional: false,
      },
    ]),
  );
  for (const match of matches) {
    if (
      match.competitionId !== competition._id ||
      match.published === false ||
      !["played", "awarded"].includes(match.status) ||
      !hasScore(match)
    )
      continue;
    const home = rows.get(match.homeId ?? ""),
      away = rows.get(match.awayId ?? "");
    if (!home || !away) continue;
    for (const [row, scored, conceded] of [
      [home, match.homeScore!, match.awayScore!],
      [away, match.awayScore!, match.homeScore!],
    ] as const) {
      row.played++;
      row.scored += scored;
      row.conceded += conceded;
      row.difference = row.scored - row.conceded;
      if (scored > conceded) {
        row.won++;
        row.points += competition.winPoints;
      } else if (scored === conceded) {
        row.drawn++;
        row.points += competition.drawPoints;
      } else {
        row.lost++;
        if (match.status === "awarded") row.awardedLoss = true;
        row.points += competition.lossPoints;
      }
    }
  }
  const ordered = [...rows.values()].sort((a, b) => b.points - a.points);
  type Row = (typeof ordered)[number];
  const result: Row[] = [];
  const fixtures = matches.filter((m) => m.competitionId === competition._id);
  const completed = (m: Match) =>
    m.published !== false &&
    (m.status === "played" || m.status === "awarded") &&
    hasScore(m);
  for (let start = 0; start < ordered.length;) {
    let end = start + 1;
    while (
      end < ordered.length &&
      ordered[end].points === ordered[start].points
    )
      end++;
    const group = ordered.slice(start, end);
    const ids = new Set(group.map((r) => r.id));
    const mutual = fixtures.filter(
      (m) => ids.has(m.homeId ?? "") && ids.has(m.awayId ?? ""),
    );
    const meetings = competition.headToHeadMeetings ?? 2;
    // Do not infer a completed head-to-head from a partially entered fixture list.
    const mutualComplete = group.every((a, i) =>
      group.slice(i + 1).every((b) => {
        const pair = mutual.filter(
          (m) =>
            (m.homeId === a.id && m.awayId === b.id) ||
            (m.homeId === b.id && m.awayId === a.id),
        );
        return pair.length === meetings && pair.every(completed);
      }),
    );
    const useMutual =
      competition.standingsRule === "tff" && group.length > 1 && mutualComplete;
    const mini = new Map(
      group.map((r) => [r.id, { points: 0, difference: 0, scored: 0 }]),
    );
    if (useMutual)
      for (const m of mutual) {
        for (const [id, scored, conceded] of [
          [m.homeId!, m.homeScore!, m.awayScore!],
          [m.awayId!, m.awayScore!, m.homeScore!],
        ] as const) {
          const row = mini.get(id)!;
          row.scored += scored;
          row.difference += scored - conceded;
          row.points +=
            scored > conceded
              ? competition.winPoints
              : scored === conceded
                ? competition.drawPoints
                : competition.lossPoints;
        }
      }
    // TFF Article 9: one mini-table for the entire tied group, never recursive.
    // Away goals have no special weight; mini-table goals apply only to 3+ teams.
    const compare = (a: Row, b: Row) => {
      const ma = mini.get(a.id)!,
        mb = mini.get(b.id)!;
      return (
        (useMutual
          ? mb.points - ma.points ||
            mb.difference - ma.difference ||
            (group.length > 2 ? mb.scored - ma.scored : 0)
          : 0) ||
        b.difference - a.difference ||
        b.scored - a.scored ||
        (useMutual ? Number(a.awardedLoss) - Number(b.awardedLoss) : 0)
      );
    };
    group.sort((a, b) => compare(a, b) || a.name.localeCompare(b.name, "tr"));
    group.forEach((row, i) => {
      row.provisional =
        competition.standingsRule === "tff" &&
        group.length > 1 &&
        !mutualComplete;
      const equalPrevious = i > 0 && compare(group[i - 1], row) === 0;
      row.rank = equalPrevious ? group[i - 1].rank : start + i + 1;
      row.tied =
        equalPrevious ||
        (i + 1 < group.length && compare(row, group[i + 1]) === 0);
    });
    result.push(...group);
    start = end;
  }
  return result;
}

/** Circle method: one game per participant per round, odd counts receive a bye. */
export function generateFixtures(
  competition: Competition,
  opponents: Opponent[],
  startDate: string,
  intervalDays: number,
  returnLeg: boolean,
): Match[] {
  const names = new Map([
    ["club", competition.clubName],
    ...opponents.map((o) => [o._id, o.name] as [string, string]),
  ]);
  const rotation: (string | null)[] = ["club", ...competition.opponentIds];
  if (rotation.length % 2) rotation.push(null);
  const rounds = rotation.length - 1,
    fixtures: Match[] = [];
  for (let round = 0; round < rounds; round++) {
    for (let pair = 0; pair < rotation.length / 2; pair++) {
      const a = rotation[pair],
        b = rotation[rotation.length - 1 - pair];
      if (!a || !b) continue;
      for (let leg = 0; leg < (returnLeg ? 2 : 1); leg++) {
        const swapped = (round % 2 === 1) !== (leg === 1);
        const homeId = swapped ? b : a,
          awayId = swapped ? a : b;
        const week = round + 1 + leg * rounds;
        const date = new Date(`${startDate}T12:00:00Z`);
        date.setUTCDate(date.getUTCDate() + (week - 1) * intervalDays);
        fixtures.push({
          id: `${competition._id}:${homeId}:${awayId}`,
          competitionId: competition._id,
          teamSlug: competition.teamSlug,
          season: competition.season,
          league: competition.name,
          kind: competition.kind,
          week,
          date: date.toISOString().slice(0, 10),
          time: null,
          homeId,
          awayId,
          homeTeam: names.get(homeId)!,
          awayTeam: names.get(awayId)!,
          homeScore: null,
          awayScore: null,
          status: "unreported",
          venue: null,
          note: null,
          published: false,
          report: null,
        });
      }
    }
    rotation.splice(1, 0, rotation.pop()!);
  }
  return fixtures.sort(
    (a, b) =>
      (a.week ?? Number.MAX_SAFE_INTEGER) - (b.week ?? Number.MAX_SAFE_INTEGER),
  );
}

export function formatMatchDate(date: string) {
  if (!date) return "Tarih henüz açıklanmadı";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function selectMatches(
  matches: Match[],
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
      if (!a.date || !b.date) {
        if (!a.date && !b.date)
          return (
            (a.week ?? Number.MAX_SAFE_INTEGER) -
            (b.week ?? Number.MAX_SAFE_INTEGER)
          );
        return a.date ? -1 : 1;
      }
      const chronological = `${a.date}${a.time ?? "00:00"}`.localeCompare(
        `${b.date}${b.time ?? "00:00"}`,
      );
      return (
        (resultsOnly ? -chronological : chronological) ||
        a.league.localeCompare(b.league) ||
        (a.week ?? Number.MAX_SAFE_INTEGER) -
          (b.week ?? Number.MAX_SAFE_INTEGER)
      );
    });
}
