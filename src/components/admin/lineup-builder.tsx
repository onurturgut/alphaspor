"use client";

import { useMemo, useState } from "react";
import type { AcademyPlayer } from "@/lib/academy";
import {
  formationIds,
  formationSlots,
  isFormationId,
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
  const formation: FormationId = isFormationId(report.formation)
    ? report.formation
    : "4-3-3";
  const slots = formationSlots(formation);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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
      ids.slice(0, nextSlots.length).map((playerId, index) => ({
        slotId: nextSlots[index].id,
        playerId,
      })),
      report.bench,
      value,
    );
    setSelectedSlot(null);
  }

  function assign(playerId: string) {
    if (!selectedSlot) return;
    const current = lineup.find((item) => item.slotId === selectedSlot);
    const previous = lineup.find((item) => item.playerId === playerId);
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
          <span>{lineup.length}/11</span>
        </div>
        <label className="admin-formation-select">
          Diziliş
          <select
            value={formation}
            onChange={(event) => changeFormation(event.target.value)}
          >
            {formationIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <p className="admin-help">
          Bir pozisyona, ardından o pozisyonda oynayacak futbolcuya dokunun.
        </p>
        <div
          className="admin-lineup-pitch"
          aria-label={`${formation} saha dizilişi`}
        >
          <span className="admin-pitch-turf" />
          <svg
            className="admin-pitch-lines"
            viewBox="0 0 680 1050"
            aria-hidden="true"
          >
            <rect x="22" y="22" width="636" height="1006" />
            <line x1="22" y1="525" x2="658" y2="525" />
            <circle cx="340" cy="525" r="92" />
            <circle className="admin-pitch-dot" cx="340" cy="525" r="7" />
            <rect x="142" y="22" width="396" height="160" />
            <rect x="142" y="868" width="396" height="160" />
            <rect x="255" y="22" width="170" height="62" />
            <rect x="255" y="966" width="170" height="62" />
          </svg>
          {slots.map((item) => {
            const assignment = lineup.find((row) => row.slotId === item.id);
            const player = assignment
              ? playerById(assignment.playerId)
              : undefined;
            return (
              <button
                key={item.id}
                type="button"
                className={`admin-pitch-player${selectedSlot === item.id ? " is-selected" : ""}${player ? "" : " is-empty"}`}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                onClick={() =>
                  setSelectedSlot(selectedSlot === item.id ? null : item.id)
                }
                aria-label={`${item.label}: ${player?.name ?? "oyuncu seç"}`}
              >
                <b>{player ? initials(player.name) : "+"}</b>
                <span>{player?.name ?? item.label}</span>
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
                    <button type="button" onClick={() => assign(player.id)}>
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
                    onField ? "İlk 11" : onBench ? "Yedek" : "Kadro dışı"
                  }
                >
                  {onField ? "İlk 11" : onBench ? "Yedek" : "Kadro dışı"}
                </em>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
