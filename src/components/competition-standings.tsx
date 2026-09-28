"use client";
import { useState } from "react";
import {
  standings,
  type Competition,
  type Opponent,
  type Match,
} from "@/lib/matches";

export function CompetitionStandings({
  competitions,
  opponents,
  matches,
}: {
  competitions: Competition[];
  opponents: Opponent[];
  matches: Match[];
}) {
  const [selected, setSelected] = useState("");
  const options = competitions.filter(
    (c) => c.kind !== "friendly" && c.standingsEnabled !== false,
  );
  const competition = options.find((c) => c._id === selected) ?? options[0];
  if (!competition)
    return (
      <div className="match-center__empty">
        <h3>Puan durumu henüz bulunmuyor.</h3>
        <p>Bu takım ve sezon için yayımlanmış bir puan tablosu yok.</p>
      </div>
    );
  const rows = standings(competition, opponents, matches);
  return (
    <div className="match-standings">
      <label>
        Organizasyon
        <select
          value={competition._id}
          onChange={(e) => setSelected(e.target.value)}
        >
          {options.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} · {c.season}
            </option>
          ))}
        </select>
      </label>
      <div className="match-standings__scroll">
        <table>
          <caption>
            {competition.name} · {competition.season}
          </caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Takım</th>
              {["O", "G", "B", "M", "AG", "YG", "AV", "P"].map((title) => (
                <th scope="col" key={title}>
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={row.id === "club" ? "match-standings__club" : ""}
              >
                <td>
                  {row.rank}
                  {row.tied ? "=" : ""}
                </td>
                <th scope="row">{row.name}</th>
                <td>{row.played}</td>
                <td>{row.won}</td>
                <td>{row.drawn}</td>
                <td>{row.lost}</td>
                <td>{row.scored}</td>
                <td>{row.conceded}</td>
                <td>{row.difference}</td>
                <td>
                  <strong>{row.points}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        O: Oynanan · G: Galibiyet · B: Beraberlik · M: Mağlubiyet · AG/YG:
        Atılan/Yenen gol · AV: Averaj · P: Puan
      </p>
      <p>
        Galibiyet {competition.winPoints}, beraberlik {competition.drawPoints},
        mağlubiyet {competition.lossPoints} puan. Yalnızca yayımlanan, sonucu
        kesinleşmiş maçlar hesaba katılır.
      </p>
      <p>
        {competition.standingsRule === "tff"
          ? "Eşit puanda önce takımların aralarındaki puan ve averaj; üç veya daha fazla takımda aralarındaki atılan gol de karşılaştırılır. Ardından genel averaj, atılan gol ve hükmen yenilgisi olmayan takımın üstünlüğü uygulanır. Aralarındaki tüm maçlar tamamlanana kadar genel averajla geçici sıralama gösterilir."
          : "Eşit puanda genel averaj ve atılan gol karşılaştırılır."}{" "}
        Eşit kalanlar aynı sırayı paylaşır (=); alfabetik diziliş üstünlük
        sağlamaz.
      </p>
      {rows.some(
        (r) => r.tied && !r.provisional && competition.standingsRule === "tff",
      ) && (
        <p>
          Eşitliği bozulmayan takımların kesin sırası, organizasyonun ek
          müsabaka sonucuna göre belirlenmelidir.
        </p>
      )}
    </div>
  );
}
