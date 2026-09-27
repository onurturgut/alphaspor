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
  const options = competitions.filter((c) => c.kind !== "friendly");
  const competition = options.find((c) => c._id === selected) ?? options[0];
  if (!competition) return null;
  const rows = standings(competition, opponents, matches);
  return (
    <details className="match-standings">
      <summary>Puan durumu</summary>
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
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className={row.id === "club" ? "match-standings__club" : ""}
              >
                <td>{i + 1}</td>
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
        Yayımlanan tamamlanmış maçlardan hesaplanır. Sıralama: puan, genel
        averaj, atılan gol; eşitlik sürerse takım adına göre listelenir.
      </p>
    </details>
  );
}
