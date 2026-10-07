"use client";

import Image from "next/image";
import { useMemo, useState, type CSSProperties } from "react";
import type { AcademyPlayer } from "@/lib/academy";
import {
  cinematicPitchPosition,
  createPositionBasedLineup,
  defaultFormationForPlayerCount,
  formationIdsForPlayerCount,
  formationMeta,
  formationSlots,
  isFormationId,
  mobilePitchPosition,
  type FormationId,
} from "@/lib/formations";
import type { MatchReport } from "@/lib/matches";

type Props = {
  players: AcademyPlayer[];
  report: MatchReport;
  onChange: (report: MatchReport) => void;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("tr-TR");
}

export function LineupBuilder({ players, report, onChange }: Props) {
  const matchingFormations = formationIdsForPlayerCount(report.starterCount);
  const compatibleFormations: FormationId[] = matchingFormations.length
    ? matchingFormations
    : ["4-3-3"];
  const formation: FormationId =
    isFormationId(report.formation) &&
    compatibleFormations.includes(report.formation)
      ? report.formation
      : defaultFormationForPlayerCount(report.starterCount);
  const slots = formationSlots(formation);
  const formationCategories = [
    "Dengeli",
    "Savunmacı",
    "Hücumcu",
    "Dar oyun",
    "Kanat oyunu",
  ] as const;
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [autoMessage, setAutoMessage] = useState("");

  const lineup = useMemo(() => {
    const validSlots = new Set(slots.map((item) => item.id));
    const saved = (report.lineup ?? []).filter(
      (item) =>
        validSlots.has(item.slotId) && report.starters.includes(item.playerId),
    );
    const placed = new Set(saved.map((item) => item.playerId));
    const open = slots.filter(
      (item) => !saved.some((row) => row.slotId === item.id),
    );
    const missing = report.starters.filter((id) => !placed.has(id));
    return [
      ...saved,
      ...missing.slice(0, open.length).map((playerId, index) => ({
        slotId: open[index].id,
        playerId,
      })),
    ];
  }, [report.lineup, report.starters, slots]);

  const playerById = (id: string) => players.find((player) => player.id === id);
  const updateSquad = (
    nextLineup: { slotId: string; playerId: string }[],
    nextBench = report.bench,
    nextFormation = formation,
  ) =>
    onChange({
      ...report,
      formation: nextFormation,
      lineup: nextLineup,
      starters: nextLineup.map((item) => item.playerId),
      bench: nextBench.filter(
        (id) => !nextLineup.some((item) => item.playerId === id),
      ),
    });

  function changeFormation(value: string) {
    if (!isFormationId(value)) return;
    const nextSlots = formationSlots(value);
    const ids = lineup.map((item) => item.playerId);
    updateSquad(
      ids
        .slice(0, Math.min(nextSlots.length, report.starterCount))
        .map((playerId, index) => ({
          slotId: nextSlots[index].id,
          playerId,
        })),
      report.bench,
      value,
    );
    setSelectedSlot(null);
    setAutoMessage("");
  }

  function changePlayerCount(nextCount: 8 | 11) {
    if (nextCount === report.starterCount) return;
    if (
      (report.starters.length > 0 || report.events.length > 0) &&
      !confirm(
        "Başlangıç oyuncu sayısı değişince saha yerleşimi ve maç olayları temizlenecek. Devam edilsin mi?",
      )
    )
      return;
    onChange({
      ...report,
      starterCount: nextCount,
      starters: [],
      bench: players.map((player) => player.id),
      formation: defaultFormationForPlayerCount(nextCount),
      lineup: [],
      events: [],
    });
    setSelectedSlot(null);
    setAutoMessage("");
  }

  function createAutomaticLineup() {
    const next = createPositionBasedLineup(formation, players).slice(
      0,
      report.starterCount,
    );
    const selected = new Set(next.map((item) => item.playerId));
    updateSquad(
      next,
      players
        .filter((player) => !selected.has(player.id))
        .map((player) => player.id),
      formation,
    );
    const missing = slots.length - next.length;
    setAutoMessage(
      missing
        ? `${next.length}/${slots.length} pozisyon dolduruldu. ${missing} pozisyon için uygun mevki bulunamadı.`
        : `${slots.length}/${slots.length} pozisyon mevkilere göre dolduruldu.`,
    );
    setSelectedSlot(null);
  }

  function assign(playerId: string) {
    if (!selectedSlot) return;
    const current = lineup.find((item) => item.slotId === selectedSlot);
    const previous = lineup.find((item) => item.playerId === playerId);
    if (!current && !previous && lineup.length >= report.starterCount) return;
    let next = lineup.filter(
      (item) => item.slotId !== selectedSlot && item.playerId !== playerId,
    );
    if (previous && current)
      next = [...next, { slotId: previous.slotId, playerId: current.playerId }];
    next.push({ slotId: selectedSlot, playerId });
    updateSquad(
      next,
      report.bench.filter((id) => id !== playerId),
    );
    setSelectedSlot(null);
  }

  function moveToBench(playerId: string) {
    updateSquad(
      lineup.filter((item) => item.playerId !== playerId),
      [...report.bench.filter((id) => id !== playerId), playerId],
    );
  }

  function removeFromSquad(playerId: string) {
    updateSquad(
      lineup.filter((item) => item.playerId !== playerId),
      report.bench.filter((id) => id !== playerId),
    );
  }

  const filteredPlayers = players.filter((player) =>
    `${player.name} ${player.shirtNumber ?? ""}`
      .toLocaleLowerCase("tr-TR")
      .includes(search.toLocaleLowerCase("tr-TR")),
  );

  return (
    <div className="admin-lineup-layout">
      <section className="admin-lineup-column">
        <div className="admin-lineup-heading">
          <div>
            <span className="admin-section-kicker">Oyun dizilişi</span>
            <h3>Saha yerleşimi</h3>
          </div>
          <span>
            {lineup.length}/{report.starterCount}
          </span>
        </div>
        <label className="admin-formation-select">
          Diziliş
          <select
            value={formation}
            onChange={(event) => changeFormation(event.target.value)}
          >
            {formationCategories.map((category) => {
              const options = compatibleFormations.filter(
                (id) => formationMeta[id].category === category,
              );
              return options.length ? (
                <optgroup key={category} label={category}>
                  {options.map((id) => (
                    <option key={id} value={id}>
                      {id} — {formationMeta[id].description}
                    </option>
                  ))}
                </optgroup>
              ) : null;
            })}
          </select>
        </label>
        <fieldset className="admin-lineup-count">
          <legend>Başlangıç oyuncu sayısı</legend>
          {[8, 11].map((count) => (
            <label key={count}>
              <input
                type="radio"
                name="lineup-player-count"
                value={count}
                checked={report.starterCount === count}
                onChange={() => changePlayerCount(count as 8 | 11)}
              />
              <span>{count} oyuncu</span>
            </label>
          ))}
        </fieldset>
        <button
          type="button"
          onClick={createAutomaticLineup}
          disabled={!players.length}
        >
          Pozisyonlara göre oluştur
        </button>
        {autoMessage && (
          <p className="admin-help" role="status">
            {autoMessage}
          </p>
        )}
        <p className="admin-help">
          Bir pozisyona, ardından o pozisyonda oynayacak futbolcuya dokunun.
          Başlangıç sayısına ulaştığınızda kalan pozisyonlar boş bırakılabilir.
        </p>
        <div
          className="admin-lineup-pitch"
          aria-label={`${formation} saha dizilişi`}
        >
          <Image
            className="admin-pitch-background"
            src="/media/academy/cinematic-pitch.webp"
            alt=""
            fill
            sizes="(max-width: 900px) calc(100vw - 48px), 520px"
            aria-hidden="true"
          />
          {slots.map((item) => {
            const assignment = lineup.find((row) => row.slotId === item.id);
            const player = assignment
              ? playerById(assignment.playerId)
              : undefined;
            const desktopPosition = cinematicPitchPosition(item.x, item.y);
            const mobilePosition = mobilePitchPosition(slots, item);
            return (
              <button
                key={item.id}
                type="button"
                className={`admin-pitch-player${selectedSlot === item.id ? " is-selected" : ""}${player ? "" : " is-empty"}`}
                style={
                  {
                    ...desktopPosition,
                    "--mobile-player-left": mobilePosition.left,
                    "--mobile-player-top": mobilePosition.top,
                  } as CSSProperties
                }
                onClick={() =>
                  setSelectedSlot(selectedSlot === item.id ? null : item.id)
                }
                aria-label={`${item.label}: ${player?.name ?? "oyuncu seç"}`}
                aria-pressed={selectedSlot === item.id}
              >
                <b>{player ? initials(player.name) : "+"}</b>
                <span>{player ? initials(player.name) : item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="admin-lineup-column admin-squad-panel">
        <div className="admin-lineup-heading">
          <div>
            <span className="admin-section-kicker">Takım listesi</span>
            <h3>
              {selectedSlot
                ? `${slots.find((item) => item.id === selectedSlot)?.label} için oyuncu seç`
                : "Oyuncular"}
            </h3>
          </div>
          <span>{report.bench.length} yedek</span>
        </div>
        <input
          className="admin-squad-search"
          type="search"
          value={search}
          placeholder="İsim veya forma numarası"
          aria-label="Oyuncu ara"
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="admin-squad-list">
          {filteredPlayers.map((player) => {
            const onField = lineup.some((item) => item.playerId === player.id);
            const onBench = report.bench.includes(player.id);
            const selectedPositionFilled = lineup.some(
              (item) => item.slotId === selectedSlot,
            );
            const canAssign =
              onField ||
              selectedPositionFilled ||
              lineup.length < report.starterCount;
            return (
              <div className="admin-squad-row" key={player.id}>
                <span className="admin-player-initials">
                  {initials(player.name)}
                </span>
                <span>
                  <strong>
                    {player.shirtNumber ? `#${player.shirtNumber} · ` : ""}
                    {player.name}
                  </strong>
                  <small>{player.position}</small>
                </span>
                <span className="admin-squad-actions">
                  {selectedSlot && (
                    <button
                      type="button"
                      disabled={!canAssign}
                      onClick={() => assign(player.id)}
                    >
                      Ata
                    </button>
                  )}
                  {onField && (
                    <button
                      type="button"
                      onClick={() => moveToBench(player.id)}
                    >
                      Yedek
                    </button>
                  )}
                  {!onField && !onBench && !selectedSlot && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...report,
                          bench: [...report.bench, player.id],
                        })
                      }
                    >
                      Yedeğe al
                    </button>
                  )}
                  {onBench && (
                    <button
                      type="button"
                      onClick={() => removeFromSquad(player.id)}
                    >
                      Kadro dışı
                    </button>
                  )}
                </span>
                <em
                  data-role={
                    onField ? "Başlangıç" : onBench ? "Yedek" : "Kadro dışı"
                  }
                >
                  {onField ? "Başlangıç" : onBench ? "Yedek" : "Kadro dışı"}
                </em>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
