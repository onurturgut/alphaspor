import { orderedEvents, type Match } from "@/lib/matches";

export function MatchDetails({ match }: { match: Match }) {
  const report = match.report;
  if (!report) return null;
  const name = (id: string | null) =>
    report.playerNames?.[id ?? ""] ?? (id ? "Oyuncu" : "Rakip oyuncu");
  return (
    <details className="match-report">
      <summary>Kadro ve maç detayları</summary>
      <div className="match-report__lineup">
        <div>
          <h4>Başlangıç kadrosu</h4>
          <ul>
            {report.starters.map((id) => (
              <li key={id}>{name(id)}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Yedekler</h4>
          <ul>
            {report.bench.map((id) => (
              <li key={id}>{name(id)}</li>
            ))}
          </ul>
        </div>
      </div>
      <h4>Maç olayları</h4>
      {report.events.length ? (
        <ol className="match-report__events">
          {orderedEvents(report).map((event) => (
            <li key={event.id}>
              <strong>{event.minute}′</strong>
              <span>
                {event.type === "substitution" ? (
                  <>
                    {name(event.outId)} çıktı → {name(event.inId)} girdi
                  </>
                ) : (
                  <>
                    {event.side === "home" ? match.homeTeam : match.awayTeam} ·{" "}
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
        <p>Henüz maç olayı kaydedilmedi.</p>
      )}
      <p>Maç süresi: {report.duration} dakika</p>
    </details>
  );
}
