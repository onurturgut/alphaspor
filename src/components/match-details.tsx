import Image from "next/image";
import { PiArrowsLeftRightBold, PiSoccerBallFill } from "react-icons/pi";
import { orderedEvents, type Match, type MatchReport } from "@/lib/matches";
import { cinematicPitchPosition, formationSlots } from "@/lib/formations";

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("tr-TR");
}

function enteredAt(report: MatchReport, playerId: string) {
  return orderedEvents(report).find(
    (event) => event.type === "substitution" && event.inId === playerId,
  )?.minute;
}

function exitedAt(report: MatchReport, playerId: string) {
  return orderedEvents(report).find(
    (event) => event.type === "substitution" && event.outId === playerId,
  )?.minute;
}

export function MatchDetails({ match }: { match: Match }) {
  const report = match.report;
  if (!report) return null;

  const name = (id: string | null) =>
    report.playerNames?.[id ?? ""] ?? (id ? "Oyuncu" : "Rakip oyuncu");
  const photo = (id: string) => report.playerPhotos?.[id];
  const slots = formationSlots(report.formation);
  const events = orderedEvents(report);
  const savedLineup = (report.lineup ?? []).filter(
    (item) =>
      report.starters.includes(item.playerId) &&
      slots.some((slot) => slot.id === item.slotId),
  );
  const assignedPlayers = new Set(savedLineup.map((item) => item.playerId));
  const assignedSlots = new Set(savedLineup.map((item) => item.slotId));
  const availableSlots = slots.filter((slot) => !assignedSlots.has(slot.id));
  const lineup = [
    ...savedLineup,
    ...report.starters
      .filter((id) => !assignedPlayers.has(id))
      .map((playerId, index) => ({
        playerId,
        slotId: availableSlots[index]?.id,
      }))
      .filter((item): item is { playerId: string; slotId: string } =>
        Boolean(item.slotId),
      ),
  ];

  return (
    <details className="match-report">
      <summary>Kadro ve maç detayları</summary>
      <div className="match-report__grid">
        <details open className="match-report__panel match-report__field-panel">
          <summary className="match-report__panel-head">
            <div>
              <span>Başlangıç kadrosu</span>
              <h4>Saha gösterimi</h4>
            </div>
            <small>{report.formation ?? "4-3-3"}</small>
          </summary>

          {lineup.length ? (
            <div className="match-report__pitch">
              <Image
                className="match-report__pitch-image"
                src="/media/academy/cinematic-pitch.webp"
                alt="Alfa Spor stadyumu ve saha yerleşimi"
                fill
                sizes="(max-width: 760px) calc(100vw - 44px), 540px"
              />
              {lineup.map((item) => {
                const position = slots.find((slot) => slot.id === item.slotId);
                if (!position) return null;
                const playerName = name(item.playerId);
                const exit = exitedAt(report, item.playerId);
                return (
                  <div
                    className="match-report__player"
                    key={item.slotId}
                    style={cinematicPitchPosition(position.x, position.y)}
                  >
                    <span className="match-report__avatar">
                      {photo(item.playerId) ? (
                        <Image
                          src={photo(item.playerId)!}
                          alt=""
                          fill
                          sizes="42px"
                        />
                      ) : (
                        initials(playerName)
                      )}
                    </span>
                    <strong>{playerName}</strong>
                    <small>{position.label}</small>
                    {exit != null && <em>↓ {exit}′ çıktı</em>}
                  </div>
                );
              })}
            </div>
          ) : (
            <ul className="match-report__fallback-lineup">
              {report.starters.map((id) => (
                <li key={id}>{name(id)}</li>
              ))}
            </ul>
          )}
        </details>

        <details open className="match-report__panel match-report__bench-panel">
          <summary className="match-report__panel-head">
            <div>
              <span>Kadro</span>
              <h4>Yedekler</h4>
            </div>
            <small>{report.bench.length} oyuncu</small>
          </summary>
          <ul className="match-report__bench">
            {report.bench.map((id) => {
              const entry = enteredAt(report, id);
              return (
                <li key={id}>
                  <strong>{name(id)}</strong>
                  {entry != null && <small>↑ {entry}′ oyuna girdi</small>}
                </li>
              );
            })}
          </ul>
        </details>

        <details open className="match-report__panel match-report__events-panel">
          <summary className="match-report__panel-head">
            <div>
              <span>Kadro ve maç</span>
              <h4>Maç detayları</h4>
            </div>
            <small>{events.length} olay</small>
          </summary>
          {events.length ? (
            <ol className="match-report__events">
              {events.map((event) => (
                <li key={event.id}>
                  <strong>{event.minute}′</strong>
                  <i aria-hidden="true">
                    {event.type === "substitution" ? (
                      <PiArrowsLeftRightBold />
                    ) : (
                      <PiSoccerBallFill />
                    )}
                  </i>
                  <span>
                    <b>
                      {event.type === "substitution"
                        ? "Oyuncu değişikliği"
                        : `GOL · ${event.side === "home" ? match.homeTeam : match.awayTeam}`}
                    </b>
                    {event.type === "substitution" ? (
                      <>
                        {" "}
                        · {name(event.outId)} çıktı → {name(event.inId)} girdi
                      </>
                    ) : (
                      <>
                        {" · "}
                        {name(event.playerId)}
                        {event.kind === "penalty"
                          ? " (penaltı)"
                          : event.kind === "own"
                            ? " (kendi kalesine)"
                            : ""}
                        {event.assistId && (
                          <small>Asist: {name(event.assistId)}</small>
                        )}
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="match-report__empty">Henüz maç olayı kaydedilmedi.</p>
          )}
          <p className="match-report__duration">
            Maç süresi: {report.duration} dakika
          </p>
        </details>
      </div>
    </details>
  );
}
