"use client";
import { useState } from "react";
import { Field } from "./fields";
import type { Draft, TeamOption } from "./editor";
import {
  generateFixtures,
  type Competition,
  type Opponent,
} from "@/lib/matches";

export function CompetitionFields({
  draft,
  update,
  teams,
  opponents,
  onGenerated,
  canGenerate,
}: {
  draft: Draft;
  update: (value: Partial<Draft>) => void;
  teams: TeamOption[];
  opponents: Opponent[];
  onGenerated: () => Promise<void>;
  canGenerate: boolean;
}) {
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [intervalDays, setInterval] = useState(7);
  const [returnLeg, setReturnLeg] = useState(true);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const fixtureInputValid =
    /^\d{4}-\d{2}-\d{2}$/.test(startDate) &&
    !isNaN(new Date(`${startDate}T12:00:00Z`).getTime()) &&
    Number.isInteger(intervalDays) &&
    intervalDays >= 1 &&
    intervalDays <= 30;
  const fixtures =
    preview && fixtureInputValid && draft._id
      ? generateFixtures(
          draft as Competition,
          opponents,
          startDate,
          intervalDays,
          returnLeg,
        )
      : [];
  const field = (key: keyof Draft, label: string, type = "text") => (
    <Field
      label={label}
      type={type}
      required
      value={draft[key] as string | number}
      onChange={(v) => update({ [key]: type === "number" ? Number(v) : v })}
    />
  );
  return (
    <>
      <div className="admin-form-grid">
        {field("name", "Organizasyon adı")}
        <Field
          label="Takım / yaş grubu"
          value={draft.teamSlug ?? ""}
          onChange={(teamSlug) => update({ teamSlug })}
          options={teams.map((t) => ({ value: t.slug, label: t.name }))}
        />
        {field("season", "Sezon")}
        {field("clubName", "Fikstürde kulübümüzün adı")}
        <Field
          label="Organizasyon türü"
          value={draft.kind ?? "official"}
          options={[
            { value: "official", label: "Lig / resmî maç" },
            { value: "friendly", label: "Hazırlık (puan tablosu yok)" },
            { value: "tournament", label: "Lig usulü turnuva" },
          ]}
          onChange={(kind) => update({ kind: kind as Competition["kind"] })}
        />
        {field("duration", "Normal maç süresi (dakika)", "number")}
        {field("starterCount", "Başlangıç oyuncu sayısı (1–11)", "number")}
        {field("winPoints", "Galibiyet puanı", "number")}
        {field("drawPoints", "Beraberlik puanı", "number")}
        {field("lossPoints", "Mağlubiyet puanı", "number")}
        <label className="admin-check">
          <input
            type="checkbox"
            checked={draft.allowReentry ?? false}
            onChange={(e) => update({ allowReentry: e.target.checked })}
          />
          Oyuncular tekrar oyuna girebilir
        </label>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={draft.published ?? false}
            onChange={(e) => update({ published: e.target.checked })}
          />
          Organizasyonu ve puan tablosunu yayımla
        </label>
      </div>
      <h3>Katılımcı rakipler ({draft.opponentIds?.length ?? 0})</h3>
      <p className="admin-help">
        Kulübümüz otomatik katılır. Eksik rakipleri önce Rakipler bölümünden
        ekleyin. Maçlar oluşturulduktan sonra katılımcılar ve oyun kuralları
        kilitlenir.
      </p>
      <label>
        Rakip ara
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="admin-roster-grid">
        {opponents
          .filter((o) =>
            o.name
              .toLocaleLowerCase("tr")
              .includes(query.toLocaleLowerCase("tr")),
          )
          .map((o) => (
            <label className="admin-check" key={o._id}>
              <input
                type="checkbox"
                checked={draft.opponentIds?.includes(o._id) ?? false}
                onChange={(e) =>
                  update({
                    opponentIds: e.target.checked
                      ? [...(draft.opponentIds ?? []), o._id]
                      : draft.opponentIds?.filter((id) => id !== o._id),
                  })
                }
              />
              {o.name}
            </label>
          ))}
      </div>
      <p className="admin-help">
        Sıralama: puan → genel averaj → atılan gol → takım adı. Tam puan tablosu
        için rakiplerin kendi aralarındaki sonuçlarını da girin.
      </p>
      {draft._id && canGenerate ? (
        <details className="admin-fixture-generator">
          <summary>Otomatik fikstür oluştur</summary>
          <p className="admin-help">
            Önce organizasyon değişikliklerini kaydedin. Fikstür kayıtlı
            kurallarla oluşturulur; yeni maçlar taslak kalır. Yeniden
            çalıştırmak mevcut maçları değiştirmez veya silinen maçları geri
            getirmez.
          </p>
          <div className="admin-form-grid">
            <Field
              label="İlk hafta tarihi"
              type="date"
              value={startDate}
              onChange={setStartDate}
            />
            <Field
              label="Haftalar arası gün"
              type="number"
              value={intervalDays}
              onChange={(v) => setInterval(Number(v))}
            />
            <label className="admin-check">
              <input
                type="checkbox"
                checked={returnLeg}
                onChange={(e) => setReturnLeg(e.target.checked)}
              />
              Rövanşlı fikstür
            </label>
          </div>
          <button
            type="button"
            disabled={!fixtureInputValid || busy}
            onClick={() => setPreview(true)}
          >
            Fikstürü önizle
          </button>
          {preview && (
            <>
              <p>
                {fixtures.length} maç · Maç tarihleri sonradan düzenlenebilir.
              </p>
              <div className="admin-fixture-preview">
                {fixtures.map((m) => (
                  <p key={m.id}>
                    {m.week}. hafta · {m.date} · {m.homeTeam} — {m.awayTeam}
                  </p>
                ))}
              </div>
              <button
                type="button"
                className="admin-primary"
                disabled={busy || !fixtures.length}
                onClick={async () => {
                  setBusy(true);
                  setMessage("");
                  try {
                    const response = await fetch("/api/admin/fixtures", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        competitionId: draft._id,
                        version: draft._rev,
                        startDate,
                        intervalDays,
                        returnLeg,
                      }),
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error);
                    alert(
                      `${result.created} taslak maç oluşturuldu. ${result.existing} mevcut kayıt korundu.`,
                    );
                    await onGenerated();
                  } catch (error) {
                    setMessage(
                      error instanceof Error
                        ? error.message
                        : "Fikstür oluşturulamadı.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Oluşturuluyor…" : "Taslak maçları oluştur"}
              </button>
            </>
          )}
          {message && (
            <p role="alert" className="admin-alert error">
              {message}
            </p>
          )}
        </details>
      ) : (
        <p className="admin-help">
          Fikstür üretmek için önce organizasyonu kaydedin, ardından tekrar
          açın.
        </p>
      )}
    </>
  );
}
