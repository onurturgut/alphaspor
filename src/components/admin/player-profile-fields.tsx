"use client";

import { Field } from "./fields";
import { matchKinds, type AcademyPlayer, type Appearance } from "@/lib/academy";

export function PlayerProfileFields({
  player,
  season,
  onChange,
}: {
  player: AcademyPlayer;
  season: string;
  onChange: (player: AcademyPlayer) => void;
}) {
  const rows = player.appearances ?? [];
  function updateRow(id: string, patch: Partial<Appearance>) {
    onChange({
      ...player,
      appearances: rows.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    });
  }
  function numberField(
    row: Appearance,
    key: "goals" | "assists" | "minutes" | "saves",
    label: string,
  ) {
    return (
      <Field
        label={label}
        type="number"
        value={row[key]}
        onChange={(value) =>
          updateRow(row.id, { [key]: value === "" ? null : Number(value) })
        }
        hint="Bilinmiyorsa boş; kayıtlı sıfır için 0."
      />
    );
  }
  function booleanField(
    row: Appearance,
    key: "started" | "cleanSheet",
    label: string,
  ) {
    return (
      <Field
        label={label}
        value={
          row[key] === null || row[key] === undefined
            ? ""
            : row[key]
              ? "yes"
              : "no"
        }
        options={[
          { value: "", label: "Bilgi yok" },
          { value: "yes", label: "Evet" },
          { value: "no", label: "Hayır" },
        ]}
        onChange={(value) =>
          updateRow(row.id, { [key]: value === "" ? null : value === "yes" })
        }
      />
    );
  }
  return (
    <details className="admin-player-profile">
      <summary>
        Oyuncu profili ve maç istatistikleri{" "}
        <span>({rows.length} maç kaydı)</span>
      </summary>
      <div className="admin-form-grid">
        <Field
          label="Forma numarası"
          type="number"
          value={player.shirtNumber}
          onChange={(value) =>
            onChange({
              ...player,
              shirtNumber: value === "" ? null : Number(value),
            })
          }
        />
        <Field
          label="Tercih ettiği ayak"
          value={player.foot ?? ""}
          options={[
            { value: "", label: "Belirtilmemiş" },
            { value: "right", label: "Sağ" },
            { value: "left", label: "Sol" },
            { value: "both", label: "İki ayak" },
          ]}
          onChange={(value) =>
            onChange({ ...player, foot: value as AcademyPlayer["foot"] })
          }
        />
        <Field
          label="Bu dönemki hedefi (herkese açık)"
          value={player.goal}
          multiline
          onChange={(goal) => onChange({ ...player, goal })}
          hint="Oyuncu profilinde yayımlanacak kısa gelişim hedefi."
        />
        <Field
          label="Güçlü yanı (herkese açık)"
          value={player.strength}
          multiline
          onChange={(strength) => onChange({ ...player, strength })}
        />
      </div>
      <div className="admin-section-heading">
        <h4>Katıldığı maçlar</h4>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...player,
              appearances: [
                ...rows,
                {
                  id: crypto.randomUUID(),
                  season,
                  date: "",
                  opponent: "",
                  kind: "official",
                  goals: null,
                  assists: null,
                  minutes: null,
                  started: null,
                  saves: null,
                  cleanSheet: null,
                },
              ],
            })
          }
        >
          + Maç kaydı ekle
        </button>
      </div>
      <p className="admin-stats-hint">
        Yalnızca oyuncunun katıldığı maçları ekleyin. Maç, gol ve asist
        toplamları bu kayıtlardan hesaplanır. Bilinmeyen alanları boş bırakın.
        Buradaki kayıtlar oyuncuya aittir; takımın maç merkezi kayıtlarını
        değiştirmez.
      </p>
      {rows.length === 0 && (
        <p className="admin-empty">
          Henüz bireysel maç kaydı yok. Sitede istatistikler “—” görünür.
        </p>
      )}
      {rows.map((row, index) => (
        <div key={row.id} className="admin-subcard">
          <div className="admin-section-heading">
            <strong>
              {index + 1}. {row.opponent || "Yeni maç"}
            </strong>
            <button
              type="button"
              className="admin-danger-text"
              onClick={() => {
                if (
                  confirm(
                    "Bu oyuncunun maç kaydı kaldırılsın mı? Kaydettiğinizde uygulanır.",
                  )
                )
                  onChange({
                    ...player,
                    appearances: rows.filter((item) => item.id !== row.id),
                  });
              }}
            >
              Kaydı kaldır
            </button>
          </div>
          <div className="admin-form-grid">
            <Field
              label="Maç sezonu"
              value={row.season}
              required
              onChange={(value) => updateRow(row.id, { season: value })}
              hint="Örn. 2026/2027"
            />
            <Field
              label="Maç tarihi"
              type="date"
              value={row.date}
              required
              onChange={(date) => updateRow(row.id, { date })}
            />
            <Field
              label="Rakip takım"
              value={row.opponent}
              required
              onChange={(opponent) => updateRow(row.id, { opponent })}
            />
            <Field
              label="Maç türü"
              value={row.kind}
              options={Object.entries(matchKinds).map(([value, label]) => ({
                value,
                label,
              }))}
              onChange={(kind) =>
                updateRow(row.id, { kind: kind as Appearance["kind"] })
              }
            />
            {numberField(row, "goals", "Gol")}
            {numberField(row, "assists", "Asist")}
            {numberField(row, "minutes", "Oynadığı dakika")}
            {booleanField(row, "started", "İlk 11 başladı mı?")}
            {player.position.toLocaleLowerCase("tr-TR").includes("kaleci") && (
              <>
                {numberField(row, "saves", "Kurtarış")}
                {booleanField(row, "cleanSheet", "Gol yemeden tamamladı mı?")}
              </>
            )}
          </div>
        </div>
      ))}
    </details>
  );
}
