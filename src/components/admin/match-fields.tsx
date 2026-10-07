"use client";

import { useId, useRef, useState } from "react";
import type { Draft, TeamOption } from "./editor";
import { Field } from "./fields";
import {
  clubSide,
  onPitch,
  orderedEvents,
  reportScore,
  validateReport,
  type Competition,
  type Match,
  type MatchEvent,
  type MatchReport,
  type Opponent,
} from "@/lib/matches";
import type { AcademyPlayer } from "@/lib/academy";
import {
  defaultFormationForPlayerCount,
  defaultStarterCountForTeam,
  formationIdsForPlayerCount,
} from "@/lib/formations";
import { LineupBuilder } from "./lineup-builder";

function PlayerSelect({
  label,
  players,
  value,
  onChange,
}: {
  label: string;
  players: AcademyPlayer[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = players.filter(
    (p) =>
      p.id === value ||
      `${p.name} ${p.shirtNumber ?? ""}`
        .toLocaleLowerCase("tr")
        .includes(search.toLocaleLowerCase("tr")),
  );
  return (
    <div className="admin-player-select">
      <label>
        {label} — ara
        <input
          type="search"
          placeholder="İsim veya forma no"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <Field
        label={label}
        value={value}
        onChange={onChange}
        options={[
          {
            value: "",
            label: label === "Asist" ? "Asist yok" : "Oyuncu seçin",
          },
          ...filtered.map((p) => ({
            value: p.id,
            label: `${p.shirtNumber ? `#${p.shirtNumber} · ` : ""}${p.name}`,
          })),
        ]}
      />
    </div>
  );
}

export function MatchFields({
  draft,
  update,
  teams,
  competitions,
  opponents,
  matches,
}: {
  draft: Draft;
  update: (changes: Partial<Draft>) => void;
  teams: TeamOption[];
  competitions: Competition[];
  opponents: Opponent[];
  matches: Match[];
}) {
  const datalist = useId();
  const [mode, setMode] = useState<"goal" | "substitution">("goal");
  const [minute, setMinute] = useState(0);
  const [side, setSide] = useState<"home" | "away">("home");
  const [kind, setKind] = useState<"normal" | "penalty" | "own">("normal");
  const [playerId, setPlayer] = useState("");
  const [assistId, setAssist] = useState("");
  const [outId, setOut] = useState("");
  const [inId, setIn] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [eventError, setEventError] = useState("");
  const [availableOpponents, setAvailableOpponents] = useState(opponents);
  const [savingTeam, setSavingTeam] = useState<"home" | "away" | null>(null);
  const [teamError, setTeamError] = useState<
    Partial<Record<"home" | "away", string>>
  >({});
  const assistRef = useRef<HTMLDivElement>(null);
  const competition = competitions.find((c) => c._id === draft.competitionId);
  const players = teams.find((t) => t.slug === draft.teamSlug)?.players ?? [];
  const report = draft.report as MatchReport | null | undefined;
  const starterCount: 8 | 11 =
    draft.starterCount ??
    (report?.starterCount === 8
      ? 8
      : report?.starterCount === 11
        ? 11
        : undefined) ??
    (competition?.starterCount === 8 ? 8 : 11);
  const score = report ? reportScore(report) : null;
  const match = { ...draft, id: draft._id ?? "new" } as Match;
  const sideOfClub = clubSide(match);
  const participants = competition
    ? [
        { _id: "club", name: competition.clubName },
        ...availableOpponents.filter(
          (o) =>
            competition.opponentIds.includes(o._id) ||
            o.teamSlugs?.includes(draft.teamSlug ?? "") ||
            o._id === draft.homeId ||
            o._id === draft.awayId,
        ),
      ]
    : [];
  function setReport(next: MatchReport) {
    const calculated = reportScore(next);
    update({
      report: next,
      ...(next.starterCount === 8 || next.starterCount === 11
        ? { starterCount: next.starterCount }
        : {}),
      ...(draft.status === "played"
        ? { homeScore: calculated.home, awayScore: calculated.away }
        : {}),
    });
  }
  function switchContext(changes: Partial<Draft>) {
    if (
      report &&
      !confirm(
        "Takım/organizasyon değişince mevcut kadro ve olaylar temizlenecek. Devam edilsin mi?",
      )
    )
      return;
    update({ ...changes, report: null });
    setEditing(null);
    setEventError("");
  }
  function chooseCompetition(id: string) {
    const c = competitions.find((item) => item._id === id);
    if (!c)
      return switchContext({ competitionId: null, homeId: null, awayId: null });
    switchContext({
      competitionId: c._id,
      teamSlug: c.teamSlug,
      league: c.name,
      season: c.season,
      kind: c.kind,
      week: c.kind === "official" ? (draft.week ?? 1) : null,
      homeId: "club",
      homeTeam: c.clubName,
      awayId: c.opponentIds[0],
      awayTeam: opponents.find((o) => o._id === c.opponentIds[0])?.name ?? "",
      homeScore: null,
      awayScore: null,
      status: "unreported",
      starterCount: c.starterCount === 8 ? 8 : 11,
    });
  }
  function changeStarterCount(value: string) {
    const next = Number(value) === 8 ? 8 : 11;
    if (next === starterCount) return;
    if (
      report &&
      !confirm(
        "Başlangıç oyuncu sayısı değişince mevcut kadro ve maç olayları temizlenecek. Devam edilsin mi?",
      )
    )
      return;
    update({
      starterCount: next,
      ...(report
        ? {
            report: {
              ...report,
              starterCount: next,
              starters: [],
              bench: [],
              formation: defaultFormationForPlayerCount(next),
              lineup: [],
              events: [],
            },
          }
        : {}),
    });
    setEditing(null);
    setEventError("");
  }
  async function saveCustomTeam(side: "home" | "away") {
    const name = String(draft[`${side}Team`] ?? "").trim();
    if (!name || !draft.teamSlug || savingTeam) return;
    setSavingTeam(side);
    setTeamError((current) => ({ ...current, [side]: "" }));
    try {
      const existing = availableOpponents.find(
        (opponent) =>
          opponent.name.toLocaleLowerCase("tr-TR") ===
          name.toLocaleLowerCase("tr-TR"),
      );
      if (existing) {
        update({ [`${side}Id`]: existing._id, [`${side}Team`]: existing.name });
        return;
      }
      const response = await fetch("/api/admin/data/opponents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: null,
          version: null,
          data: {
            name,
            teamSlugs: [draft.teamSlug],
            order: availableOpponents.length,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const opponent: Opponent = {
        _id: result.id,
        name,
        teamSlugs: [draft.teamSlug],
      };
      setAvailableOpponents((current) => [...current, opponent]);
      update({ [`${side}Id`]: opponent._id, [`${side}Team`]: opponent.name });
    } catch (error) {
      setTeamError((current) => ({
        ...current,
        [side]: error instanceof Error ? error.message : "Takım kaydedilemedi.",
      }));
    } finally {
      setSavingTeam(null);
    }
  }
  const field = (
    key: keyof Draft,
    label: string,
    type = "text",
    required = false,
  ) => (
    <Field
      label={label}
      value={draft[key] as string | number | null}
      type={type}
      required={required}
      onChange={(value) =>
        update({
          [key]:
            type === "number"
              ? value === ""
                ? null
                : Number(value)
              : ["time", "venue", "note"].includes(key) && !value
                ? null
                : value,
        })
      }
    />
  );
  const roster = report
    ? players.filter((p) =>
        [...report.starters, ...report.bench].includes(p.id),
      )
    : [];
  const eventsBefore = report
    ? {
        ...report,
        events: report.events.filter(
          (e, index) =>
            e.id !== editing &&
            (e.minute < minute ||
              (e.minute === minute &&
                (!editing ||
                  index <
                    report.events.findIndex((item) => item.id === editing)))),
        ),
      }
    : null;
  const active = eventsBefore
    ? onPitch(eventsBefore, minute)
    : new Set<string>();
  const played = new Set([
    ...(report?.starters ?? []),
    ...(eventsBefore?.events.flatMap((e) =>
      e.type === "substitution" ? [e.inId] : [],
    ) ?? []),
  ]);
  const clubActor = report && (side === report.clubSide) !== (kind === "own");
  const prior = matches
    .filter(
      (m) =>
        m.id !== draft._id &&
        m.teamSlug === draft.teamSlug &&
        m.season === draft.season &&
        m.date <= (draft.date ?? "") &&
        m.report,
    )
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  function saveEvent() {
    if (!report) return;
    const event: MatchEvent =
      mode === "goal"
        ? {
            id: editing ?? crypto.randomUUID(),
            type: "goal",
            minute,
            side,
            kind,
            playerId: clubActor ? playerId || null : null,
            assistId: clubActor && kind === "normal" ? assistId || null : null,
          }
        : {
            id: editing ?? crypto.randomUUID(),
            type: "substitution",
            minute,
            outId,
            inId,
          };
    const next = {
      ...report,
      events: editing
        ? report.events.map((e) => (e.id === editing ? event : e))
        : [...report.events, event],
    };
    const errors = validateReport(
      { ...match, report: next, status: "unreported" },
      players,
    );
    if (!Number.isInteger(minute) || minute < 0 || minute > report.duration)
      errors.unshift("Geçerli bir dakika girin.");
    if (errors.length) {
      setEventError(errors.join(" · "));
      return;
    }
    setReport(next);
    setEditing(null);
    setPlayer("");
    setAssist("");
    setIn("");
    setOut("");
    setEventError("");
  }
  function editEvent(event: MatchEvent) {
    setEditing(event.id);
    setMode(event.type);
    setMinute(event.minute);
    setEventError("");
    if (event.type === "goal") {
      setSide(event.side);
      setKind(event.kind);
      setPlayer(event.playerId ?? "");
      setAssist(event.assistId ?? "");
    } else {
      setOut(event.outId);
      setIn(event.inId);
    }
  }
  const name = (id: string | null) =>
    players.find((p) => p.id === id)?.name ??
    report?.playerNames?.[id ?? ""] ??
    "Rakip oyuncu";
  return (
    <div className="admin-match-editor">
      <div className="admin-form-grid">
        <Field
          label="Organizasyon"
          value={draft.competitionId ?? ""}
          onChange={chooseCompetition}
          options={[
            { value: "", label: "Bağımsız / eski maç" },
            ...competitions.map((c) => ({
              value: c._id,
              label: `${c.name} · ${c.season}`,
            })),
          ]}
        />
        {!competition && (
          <>
            <Field
              label="Takım"
              value={draft.teamSlug ?? ""}
              onChange={(teamSlug) => {
                const team = teams.find((t) => t.slug === teamSlug);
                switchContext({
                  teamSlug,
                  league: team?.name ?? "",
                  season: team?.season ?? "",
                  starterCount: defaultStarterCountForTeam(
                    `${teamSlug} ${team?.name ?? ""}`,
                  ),
                });
              }}
              options={teams.map((t) => ({ value: t.slug, label: t.name }))}
            />
            {field("league", "Lig / yaş grubu", "text", true)}
            {field("season", "Sezon", "text", true)}
            <Field
              label="Maç türü"
              value={draft.kind ?? "official"}
              options={[
                { value: "official", label: "Resmî maç" },
                { value: "friendly", label: "Hazırlık" },
                { value: "tournament", label: "Turnuva" },
              ]}
              onChange={(kind) =>
                update({
                  kind: kind as Match["kind"],
                  week: kind === "official" ? (draft.week ?? 1) : null,
                })
              }
            />
          </>
        )}
        {field(
          "week",
          (competition?.kind ?? draft.kind) === "official"
            ? "Hafta"
            : "Hafta (opsiyonel)",
          "number",
          (competition?.kind ?? draft.kind) === "official",
        )}
        <Field
          label="Başlangıç oyuncu sayısı"
          value={String(starterCount)}
          onChange={changeStarterCount}
          options={[
            { value: "8", label: "8 oyuncu" },
            { value: "11", label: "11 oyuncu" },
          ]}
        />
        {field("date", "Tarih (açıklanmadıysa boş bırakın)", "date")}
        {field("time", "Saat", "time")}
        {(["home", "away"] as const).map((s) =>
          competition ? (
            <div className="admin-match-team-field" key={s}>
              <Field
                label={s === "home" ? "Ev sahibi" : "Deplasman"}
                value={draft[`${s}Id`] ?? ""}
                onChange={(id) =>
                  switchContext({
                    [`${s}Id`]: id,
                    [`${s}Team`]:
                      participants.find((p) => p._id === id)?.name ?? "",
                  })
                }
                options={[
                  { value: "", label: "Takım seçin" },
                  ...participants.map((p) => ({ value: p._id, label: p.name })),
                  {
                    value: `custom-${s}`,
                    label: "+ Yeni takım adı gir",
                  },
                ]}
              />
              {draft[`${s}Id`] === `custom-${s}` && (
                <div className="admin-match-team-add">
                  <label>
                    Yeni takım adı
                    <input
                      required
                      value={draft[`${s}Team`] ?? ""}
                      placeholder="Takım adını yazın"
                      onChange={(event) =>
                        update({ [`${s}Team`]: event.target.value })
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.stopPropagation();
                          void saveCustomTeam(s);
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={
                      !String(draft[`${s}Team`] ?? "").trim() ||
                      Boolean(savingTeam)
                    }
                    onClick={() => void saveCustomTeam(s)}
                  >
                    {savingTeam === s ? "Kaydediliyor…" : "Takımı kaydet"}
                  </button>
                  {teamError[s] && (
                    <p className="admin-alert error" role="alert">
                      {teamError[s]}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <label key={s}>
              {s === "home" ? "Ev sahibi" : "Deplasman"}
              <input
                required
                list={datalist}
                value={draft[`${s}Team`] ?? ""}
                onChange={(e) => update({ [`${s}Team`]: e.target.value })}
              />
            </label>
          ),
        )}
        <datalist id={datalist}>
          <option value="FETHİYE ALFA SPOR" />
          {opponents
            .filter((o) => o.teamSlugs?.includes(draft.teamSlug ?? ""))
            .map((o) => (
              <option key={o._id} value={o.name} />
            ))}
        </datalist>
        <Field
          label="Maç durumu"
          value={draft.status ?? "unreported"}
          onChange={(status) =>
            update({
              status: status as Match["status"],
              homeScore:
                status === "played"
                  ? (score?.home ?? draft.homeScore ?? 0)
                  : status === "awarded"
                    ? (draft.homeScore ?? 0)
                    : null,
              awayScore:
                status === "played"
                  ? (score?.away ?? draft.awayScore ?? 0)
                  : status === "awarded"
                    ? (draft.awayScore ?? 0)
                    : null,
            })
          }
          options={[
            { value: "unreported", label: "Oynanacak / sonuç bekleniyor" },
            { value: "played", label: "Oynandı" },
            { value: "awarded", label: "Hükmen" },
            { value: "withdrawn", label: "İptal / çekilme" },
          ]}
        />
        {(!report || draft.status === "awarded") &&
          (draft.status === "played" || draft.status === "awarded") && (
            <>
              {field("homeScore", "Ev sahibi skoru", "number", true)}
              {field("awayScore", "Deplasman skoru", "number", true)}
            </>
          )}
        {field("venue", "Saha")}
        {field("note", "Maç notu")}
        <label className="admin-check">
          <input
            type="checkbox"
            checked={draft.published !== false}
            onChange={(e) => update({ published: e.target.checked })}
          />
          Sitede yayımla
        </label>
      </div>
      {competition && (
        <p className="admin-help">
          {competition.name} · {competition.season} · {competition.duration}{" "}
          dakika · {starterCount} kişilik başlangıç. Organizasyonun da yayında
          olması gerekir.
        </p>
      )}
      {!report && (
        <p className="admin-help">
          Sonuç girmek için maç tarihini belirtin, “Oynandı” durumunu seçin ve
          iki takımın skorunu yazıp kaydedin. Yayımlanan sonuç puan tablosuna
          otomatik yansır. Yalnızca skor girmek için kadro açmanız gerekmez.
        </p>
      )}
      {!report &&
        sideOfClub &&
        !["awarded", "withdrawn"].includes(draft.status ?? "") && (
          <button
            type="button"
            onClick={() => {
              if (
                (draft.homeScore || draft.awayScore) &&
                !confirm(
                  "Detaylı kayıt açıldığında skor girilen gollerden hesaplanır. Mevcut golleri yeniden girecek misiniz?",
                )
              )
                return;
              setReport({
                clubSide: sideOfClub,
                duration: competition?.duration ?? 90,
                starterCount,
                allowReentry: competition?.allowReentry ?? false,
                starters: [],
                bench: [],
                formation: defaultFormationForPlayerCount(starterCount),
                lineup: [],
                events: [],
              });
            }}
          >
            Kadro ve maç olaylarını aç
          </button>
        )}
      {report && (
        <>
          <div className="admin-match-banner">
            <div>
              <h3>Kadro ve maç olayları</h3>
              <p>
                Gollere göre skor:{" "}
                <strong>
                  {score?.home} : {score?.away}
                </strong>{" "}
                · {draft.homeTeam} / {draft.awayTeam}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    "Kadro ve tüm olaylar kaldırılacak. Devam edilsin mi?",
                  )
                ) {
                  update({ report: null });
                  setEditing(null);
                }
              }}
            >
              Detaylı kaydı kaldır
            </button>
          </div>
          <div className="admin-form-grid">
            <Field
              label="Gerçek maç süresi (uzatmalar dahil)"
              type="number"
              value={report.duration}
              onChange={(v) => setReport({ ...report, duration: Number(v) })}
            />
            {!competition && (
              <>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={report.allowReentry}
                    onChange={(e) =>
                      setReport({ ...report, allowReentry: e.target.checked })
                    }
                  />
                  Oyuncu tekrar oyuna girebilir
                </label>
              </>
            )}
          </div>
          <div className="admin-match-banner">
            <h3>
              Başlangıç {report.starters.length}/{report.starterCount} · Yedek{" "}
              {report.bench.length}
            </h3>
            {prior && (
              <button
                type="button"
                disabled={report.events.length > 0}
                onClick={() => {
                  const ids = new Set(players.map((p) => p.id));
                  const starters = prior
                    .report!.starters.filter((id) => ids.has(id))
                    .slice(0, report.starterCount);
                  setReport({
                    ...report,
                    starters,
                    bench: prior.report!.bench.filter((id) => ids.has(id)),
                    formation:
                      prior.report!.formation &&
                      formationIdsForPlayerCount(report.starterCount).includes(
                        prior.report!.formation,
                      )
                        ? prior.report!.formation
                        : defaultFormationForPlayerCount(report.starterCount),
                    lineup: prior.report!.lineup?.filter((item) =>
                      starters.includes(item.playerId),
                    ),
                  });
                }}
              >
                Önceki maçın kadrosunu kopyala
              </button>
            )}
          </div>
          <LineupBuilder
            players={players}
            report={report}
            onChange={setReport}
          />
          {!players.length && (
            <p className="admin-help">
              Önce Takımlar ve oyuncular bölümünden bu takıma oyuncu ekleyin.
            </p>
          )}
          <div className="admin-event-form">
            <div className="admin-tabs">
              <button
                type="button"
                aria-pressed={mode === "goal"}
                onClick={() => {
                  setMode("goal");
                  setEditing(null);
                  setPlayer("");
                  setAssist("");
                }}
              >
                Gol ekle
              </button>
              <button
                type="button"
                aria-pressed={mode === "substitution"}
                onClick={() => {
                  setMode("substitution");
                  setEditing(null);
                  setOut("");
                  setIn("");
                }}
              >
                Oyuncu değiştir
              </button>
            </div>
            <div className="admin-form-grid">
              <Field
                label="Dakika"
                type="number"
                value={minute}
                onChange={(v) => setMinute(Number(v))}
              />
              {mode === "goal" ? (
                <>
                  <Field
                    label="Golün yazıldığı takım"
                    value={side}
                    onChange={(v) => {
                      setSide(v as "home" | "away");
                      setPlayer("");
                      setAssist("");
                    }}
                    options={[
                      { value: "home", label: draft.homeTeam ?? "Ev sahibi" },
                      { value: "away", label: draft.awayTeam ?? "Deplasman" },
                    ]}
                  />
                  <Field
                    label="Gol türü"
                    value={kind}
                    onChange={(v) => {
                      setKind(v as typeof kind);
                      setPlayer("");
                      setAssist("");
                    }}
                    options={[
                      { value: "normal", label: "Normal gol" },
                      { value: "penalty", label: "Penaltı" },
                      { value: "own", label: "Kendi kalesine" },
                    ]}
                  />
                  {clubActor && (
                    <>
                      <PlayerSelect
                        label="Golü atan"
                        players={roster.filter((p) => active.has(p.id))}
                        value={playerId}
                        onChange={(id) => {
                          setPlayer(id);
                          setAssist("");
                          if (kind === "normal")
                            assistRef.current?.querySelector("input")?.focus();
                        }}
                      />
                      {kind === "normal" && (
                        <div ref={assistRef}>
                          <PlayerSelect
                            label="Asist"
                            players={roster.filter(
                              (p) => active.has(p.id) && p.id !== playerId,
                            )}
                            value={assistId}
                            onChange={setAssist}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <PlayerSelect
                    label="Çıkan oyuncu"
                    players={roster.filter((p) => active.has(p.id))}
                    value={outId}
                    onChange={setOut}
                  />
                  <PlayerSelect
                    label="Giren oyuncu"
                    players={roster.filter(
                      (p) =>
                        !active.has(p.id) &&
                        (report.allowReentry || !played.has(p.id)),
                    )}
                    value={inId}
                    onChange={setIn}
                  />
                </>
              )}
            </div>
            {eventError && (
              <p className="admin-alert error" role="alert">
                {eventError}
              </p>
            )}
            <button type="button" className="admin-primary" onClick={saveEvent}>
              {editing
                ? "Olayı güncelle"
                : mode === "goal"
                  ? "Golü listeye ekle"
                  : "Değişikliği listeye ekle"}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(null)}>
                Düzenlemeyi bırak
              </button>
            )}
            <p className="admin-help">
              Olayı listeye ekledikten sonra sayfanın altındaki Kaydet
              düğmesiyle maçı kaydedin. Aynı dakikadaki olaylar ekleme sırasıyla
              işlenir.
            </p>
          </div>
          <ol className="admin-match-events">
            {orderedEvents(report).map((event) => (
              <li key={event.id}>
                <strong>{event.minute}′</strong>
                <span>
                  {event.type === "goal"
                    ? `${event.side === "home" ? draft.homeTeam : draft.awayTeam}: ${name(event.playerId)}${event.kind === "own" ? " (kendi kalesine)" : event.kind === "penalty" ? " (penaltı)" : ""}${event.assistId ? ` · Asist: ${name(event.assistId)}` : ""}`
                    : `${name(event.outId)} çıktı → ${name(event.inId)} girdi`}
                </span>
                <button type="button" onClick={() => editEvent(event)}>
                  Düzenle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReport({
                      ...report,
                      events: report.events.filter((e) => e.id !== event.id),
                    });
                    if (editing === event.id) setEditing(null);
                  }}
                >
                  Sil
                </button>
              </li>
            ))}
          </ol>
          <p className="admin-help">
            İstatistikler yalnızca oynandı olarak kaydedilen ve yayımlanan
            maçlardan hesaplanır. Hükmen maç oyuncu istatistiklerine katılmaz.
          </p>
        </>
      )}
    </div>
  );
}
